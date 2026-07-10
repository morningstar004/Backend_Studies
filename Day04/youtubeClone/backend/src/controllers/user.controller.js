import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ResponseHandler } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const registerUser = asyncHandler(async (req, res) => {
  // get details about the User from its model
  const { fullName, email, password, username } = req.body;
  // Validate the data input

  // if(fullName || email || password || username == ""){
  //     throw new apiError(400, "All fields are required")
  // }
  if (
    [fullName, email, username, password].some((field) => {
      return field?.trim() === "";
    })
  ) {
    throw new apiError(400, "All fields should be filled");
  }

  // check if the user already exists: username, email
  const UserExist = await User.findOne({
    $or: [{ username }, { email }],
  });

  // console.log("UserExist result:", UserExist);

  if (UserExist) {
    throw new apiError(409, "User already exists");
  }

  // check for images and avatar
  const avtarLocalPath = req.files?.avtar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avtarLocalPath) {
    throw new apiError(400, "Avatar image is required.");
  }

  // upload the image to cloudinary
  const avtar = await uploadOnCloudinary(avtarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avtar) {
    throw new apiError(400, "File not uploaded");
  }

  // create user object - create enter in db
  const user = await User.create({
    fullName,
    avtar: avtar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // remove password and refresh token field from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  // check if user created
  if (!createdUser) {
    throw new apiError(500, "Something went wrong while user registration");
  }

  // send a response back to the client
  return res
    .status(201)
    .json(
      new ResponseHandler(201, "User Registered successfully", createdUser),
    );
});

/**
 * @description
 * This function retrieves a user by ID, generates both access and refresh tokens,
 * stores the refresh token in the database, and returns both tokens.
 * The validateBeforeSave option is disabled to skip model validation during save.
 */
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiError(
      500,
      "Something went wrong while generating access and refresh token.",
    );
  }
};

const loginUser = asyncHandler(async (req, res) => {
  //get data from req.body(frontend)
  const { email, username, password } = req.body;

  //login on the basis of username/email
  if (!username && !email) {
    throw new apiError(400, "Credential missing.");
  }

  //find the username/email in User DB
  const user = await User.findOne({
    $or: [
      {
        username,
      },
      {
        email,
      },
    ],
  });
  //If user not exist
  if (!user) {
    throw new apiError(404, "User does not exist.");
  }

  //Password Check
  const IsPasswordValid = await user.isPasswordCorrect(password);

  if (!IsPasswordValid) {
    throw new apiError(401, "Invalid Password.");
  }

  //access and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
  );

  //send cookie
  /*! @description
   * This step fetches the complete user profile after successful login/authentication.
   * By excluding password and refreshToken, it ensures sensitive data is not exposed.
   * This is a database operation and can be performance-intensive with large datasets.
   * Consider implementing caching strategies or database indexing if performance becomes an issue.
   *
   * @performance
   * NOTE: This is an expensive database operation. Monitor performance and consider
   * optimization strategies (indexing, caching) if database performance degrades.
   */
  const loggedIn = await User.findById(user._id).select(
    "-password -refreshToken",
  ); //finding user by ID on DB expensive step try to update if DB get slow

  const options = {
    httpOnly: true, // Cookie can't be modified by frontend, only by server
    secure: true, // increasing security
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ResponseHandler(
        200,
        {
          user: loggedIn,
          accessToken,
          refreshToken,
        },
        "User LoggedIn Successfully",
      ),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  //clear cookie and remove the refresh token
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    },
  );
  const options = {
    httpOnly: true, // Cookie can't be modified by frontend, only by server
    secure: true, // increasing security
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ResponseHandler(200, {}, "User Logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookie.refreshAccessToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new apiError(401, "Unauthorized Request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const user = User.findById(decodedToken._id);

    if (!user) {
      throw new apiError(401, "Invalid Refresh Token");
    }

    if (incomingRefreshToken !== decodedToken) {
      throw new apiError(401, "Refreshtoken expired.");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ResponseHandler(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed",
        ),
      );
  } catch (error) {
    throw new apiError(401, error?.message || "Invalid refresh Token");
  }
});
export { registerUser, loginUser, logoutUser, refreshAccessToken };
