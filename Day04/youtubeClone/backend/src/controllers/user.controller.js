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
export { registerUser, loginUser, logoutUser };
