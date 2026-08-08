import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { ResponseHandler } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import crypto from "crypto";
import nodemailer from "nodemailer";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sendPasswordResetOtp = async (email, otp) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } =
    process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    throw new apiError(
      500,
      "Email service is not configured. Set the SMTP environment variables.",
    );
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transporter.sendMail({
    from: SMTP_FROM,
    to: email,
    subject: "Your password reset OTP",
    text: `Your password reset OTP is ${otp}. It expires in 10 minutes. Do not share it with anyone.`,
  });
};

const registerUser = asyncHandler(async (req, res) => {
  // get details about the User from its model
  const { fullName, email, password, username } = req.body;
  // Validate the data input

  // if(fullName || email || password || username == ""){
  //     throw new apiError(400, "All fields are required")
  // }
  if (
    [fullName, email, username, password].some(
      (field) => !field || field.trim() === "",
    )
  ) {
    throw new apiError(400, "All fields should be filled");
  }

  if (!EMAIL_PATTERN.test(email.trim())) {
    throw new apiError(400, "Please provide a valid email address");
  }

  // check if the user already exists: username, email
  const UserExist = await User.findOne({
    $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
  });

  // console.log("UserExist result:", UserExist);

  if (UserExist) {
    throw new apiError(409, "User already exists");
  }

  // check for images and avatar
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
  if (!avatarLocalPath) {
    throw new apiError(400, "Avatar image is required.");
  }

  // upload the image to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new apiError(400, "File not uploaded");
  }

  // create user object - create enter in db
  const user = await User.create({
    fullName,
    avatar: avatar?.url || "",
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
  }).select("+password");
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
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ResponseHandler(200, "User LoggedIn Successfully", {
        user: loggedIn,
        accessToken,
        refreshToken,
      }),
    );
});

const forgotPassword = asyncHandler(async (req, res) => {
  const email = req.body?.email?.trim().toLowerCase();

  if (!email) {
    throw new apiError(400, "Email is required");
  }

  if (!EMAIL_PATTERN.test(email)) {
    throw new apiError(400, "Please provide a valid email address");
  }

  const user = await User.findOne({ email }).select(
    "+passwordResetOtpHash +passwordResetOtpExpires",
  );

  if (!user) {
    // Do not reveal whether an address is registered.
    return res
      .status(200)
      .json(new ResponseHandler(200, "If this email is registered, an OTP has been sent.", {}));
  }

  const otp = crypto.randomInt(1000, 9999).toString();
  user.passwordResetOtpHash = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");
  user.passwordResetOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  try {
    await sendPasswordResetOtp(user.email, otp);
  } catch (error) {
    user.passwordResetOtpHash = undefined;
    user.passwordResetOtpExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw error;
  }

  return res
    .status(200)
    .json(new ResponseHandler(200, "Password reset OTP sent to your email.", {}));
});

const resetPassword = asyncHandler(async (req, res) => {
  const email = req.body?.email?.trim().toLowerCase();
  const otp = req.body?.otp?.trim();
  const newPassword = req.body?.newPassword;
  const confirmPassword = req.body?.confirmPassword;

  if (!email || !otp || !newPassword || !confirmPassword) {
    throw new apiError(400, "Email, OTP, and both password fields are required.");
  }
  if (!EMAIL_PATTERN.test(email)) {
    throw new apiError(400, "Please provide a valid email address");
  }
  if (newPassword !== confirmPassword) {
    throw new apiError(400, "New passwords do not match.");
  }
  if (newPassword.length < 6) {
    throw new apiError(400, "New password must be at least 6 characters long.");
  }

  const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
  const user = await User.findOne({
    email,
    passwordResetOtpHash: otpHash,
    passwordResetOtpExpires: { $gt: new Date() },
  }).select("+passwordResetOtpHash +passwordResetOtpExpires");

  if (!user) {
    throw new apiError(400, "The OTP is invalid or has expired. Request a new one.");
  }

  user.password = newPassword;
  user.passwordResetOtpHash = undefined;
  user.passwordResetOtpExpires = undefined;
  user.refreshToken = undefined;
  await user.save();

  return res
    .status(200)
    .json(new ResponseHandler(200, "Password reset successfully. You can now sign in.", {}));
});

const logoutUser = asyncHandler(async (req, res) => {
  //clear cookie and remove the refresh token
  await User.findByIdAndUpdate(
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
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ResponseHandler(200, "User Logged Out", {}));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new apiError(401, "Unauthorized Request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new apiError(401, "Invalid Refresh Token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new apiError(401, "Refreshtoken expired.");
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id,
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ResponseHandler(200, "Access token refreshed", {
          accessToken,
          refreshToken,
        }),
      );
  } catch (error) {
    throw new apiError(401, error?.message || "Invalid refresh Token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  //Take feild requied for password change.
  const { oldPassword, newPassword, ConformPassword } = req.body;

  //get the user and its details from the database
  const user = await User.findById(req.user?._id);

  //Check if all the feilds are filled
  if (
    [oldPassword, newPassword, ConformPassword].some(
      (field) => !field || field.trim() === "",
    )
  ) {
    throw new apiError(400, "All fields are required");
  }

  //Check if the newPassword and ConformPassword are equal
  if (newPassword !== ConformPassword) {
    throw new apiError(400, "New Password and Conform Password are not equal");
  }

  //Check if the OldPassord is correct
  const IsPasswordValid = await user.isPasswordCorrect(oldPassword);

  if (!IsPasswordValid) {
    throw new apiError(401, "Invalid Password.");
  }

  //set password as newPassword
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ResponseHandler(200, "Password Has Been Changed.", {}));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const currentUser = req.user;

  return res
    .status(200)
    .json(
      new ResponseHandler(200, "Current User has been Fetched.", currentUser),
    );
});

const updateAccountDetail = asyncHandler(async (req, res) => {
  const { fullName, email, username } = req.body ?? {};

  if (!fullName || !email || !username) {
    throw new apiError(400, "All fields are required");
  }

  if ([fullName, email, username].some((field) => field?.trim() === "")) {
    throw new apiError(400, "All fields should be filled");
  }

  if (!EMAIL_PATTERN.test(email.trim())) {
    throw new apiError(400, "Please provide a valid email address");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullName,
        email,
        username: username.toLowerCase(),
      },
    },
    { new: true, runValidators: true },
  ).select("-password -refreshToken");

  if (!user) {
    throw new apiError(404, "User not found");
  }

  /* user.fullName = fullName;
  user.email = email;
  user.username = username.toLowerCase();
  user.updatedAt = Date.now();
  await user.save({ validateBeforeSave: false }); */

  return res
    .status(200)
    .json(
      new ResponseHandler(200, "Account details updated successfully.", user),
    );
});

const updateAvtar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new apiError(400, "Avatar image is required.");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new apiError(400, "File not Uploaded");
  }

  const oldAvatar = req.user?.avatar;

  await (async () => {
    if (oldAvatar) {
      try {
        await deleteFromCloudinary(oldAvatar);
      } catch (error) {
        console.error("Error deleting old avatar from Cloudinary:", error);
      }
    }
  })();

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    },
  ).select("-password -refreshToken");

  //Todo : make a function to delete the previous image from cloudinary if user has already uploaded an image before.

  return res
    .status(200)
    .json(new ResponseHandler(200, "Avatar updated successfully.", user));
});

const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new apiError(400, "Cover Image is Required.");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new apiError(400, "File not Uploaded");
  }

  const oldCoverImage = req.user?.coverImage;

  await (async () => {
    if (oldCoverImage) {
      try {
        await deleteFromCloudinary(oldCoverImage);
      } catch (error) {
        console.error("Error deleting old cover image from Cloudinary:", error);
      }
    }
  })();

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    {
      new: true,
    },
  ).select("-password -refreshToken");

  //todo: make a function to delete the previous image from cloudinary if user has already uploaded an image before.

  return res
    .status(200)
    .json(new ResponseHandler(200, "Cover Image updated successfully.", user));
});

const deleteUser = asyncHandler(async (req, res) => {
  //Todo: adduser verification via otp/password before deleting
  const userId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new apiError(400, "Invalid user ID");
  }

  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    throw new apiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ResponseHandler(200, "User deleted successfully.", {}));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new apiError(400, "Username is required");
  }

  // User.find({username})
  const channel = await User.aggregate([
    {
      $match: {
        username: username.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscriberedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscriberedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);
  console.log(channel);
  if (!channel?.length) {
    throw new apiError(404, "Channel Does not Exists");
  }

  return res
    .status(200)
    .json(
      new ResponseHandler(
        200,
        "User's Channel Fetched Successfully",
        channel[0],
      ),
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const _ = await req.user._id; //provide you with the string of user id ..//!Not the object that is stored in mongoDB
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField:"_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup:{
              from:"users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName:1,
                    username:1,
                    avatar:1,
                  }
                }
              ]
            }
          },
          {
            $addFields: {
              owner:{
                $first:"$owner",
              }
            }
          }
        ]
      }

    }
  ]);

  return res
  .status(200)
  .json(new ResponseHandler(200,"Users WatchHistory",user[0].watchHistory))
});

export {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetail,
  updateAvtar,
  updateCoverImage,
  deleteUser,
  getUserChannelProfile,
  getWatchHistory,
};
