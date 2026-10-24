import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { ResponseHandler } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import crypto from "crypto"; //help otp generation.
import nodemailer from "nodemailer"; //help in mailing the otp.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isProduction =
  process.env.NODE_ENV === "production" || process.env.RENDER === "true";
  
const authCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/api/v1",
  domain: process.env.COOKIE_DOMAIN || undefined, // Set your cookie domain in .env if needed
};

const sendPasswordResetOtp = async (email, otp) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    throw new apiError(
      500,
      "Email service is not configured. Set the SMTP environment variables.",
    );
  }

  // Create a transporter object using the SMTP configuration
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  try {
    await transporter.sendMail({
      from: SMTP_FROM,
      to: email,
      subject: "Reset your password securely",
      text: `Hello,\n\nWe received a request to reset the password for your account.\n\nYour one-time password (OTP) is: ${otp}\n\nThis code is valid for 10 minutes. Please do not share it with anyone.\n\nIf you did not request this, you can ignore this email and your account will remain secure.\n\nThanks,\nThe Safroon Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px; background: #ffffff; color: #111827;">
          <div style="font-size: 24px; font-weight: 700; margin-bottom: 16px; color: #111827;">Password Reset</div>
          <p style="margin: 0 0 12px; font-size: 16px; line-height: 1.6;">Hello,</p>
          <p style="margin: 0 0 12px; font-size: 16px; line-height: 1.6;">We received a request to reset the password for your account.</p>
          <div style="margin: 20px 0; padding: 18px 20px; border-radius: 10px; background: #f3f4f6; border: 1px solid #e5e7eb; text-align: center;">
            <div style="font-size: 13px; letter-spacing: 0.08em; color: #6b7280; text-transform: uppercase; margin-bottom: 8px;">Your OTP</div>
            <div style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #111827;">${otp}</div>
          </div>
          <p style="margin: 0 0 12px; font-size: 16px; line-height: 1.6;">This code is valid for 10 minutes. Please do not share it with anyone.</p>
          <p style="margin: 0 0 12px; font-size: 16px; line-height: 1.6;">If you did not request this, you can safely ignore this email and your account will remain secure.</p>
          <p style="margin: 24px 0 0; font-size: 16px; line-height: 1.6;">Thanks,<br />The Safroon Team</p>
        </div>
      `,
    });
  } catch (error) {
    // Gmail does not allow a normal account password for SMTP. Keeping this
    // message explicit prevents the Nodemailer stack trace from reaching users.
    if (error.code === "EAUTH" || error.responseCode === 535) {
      throw new apiError(
        502,
        "Gmail rejected the SMTP credentials. Ensure SMTP_USER is the Google account that generated the app password and SMTP_PASS is a valid 16-character Google App Password, not your regular account password.",
      );
    }

    throw error;
  }
};

// 01
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

// 02
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new apiError(404, "User not found.");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Support multiple refresh tokens for multi-device login
    if (!Array.isArray(user.refreshTokens)) {
      user.refreshTokens = [];
    }

    user.refreshTokens.push(refreshToken);
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    if (!isProduction) {
      // Only log detailed errors in non-production environments
      console.error("Access and refresh token generation failed.", error);
    }

    throw new apiError(500, "Failed to generate tokens.");
  }
};

// 03
const loginUser = asyncHandler(async (req, res) => {
  //get data from req.body(frontend)
  const { email, username, password } = req.body;

  //login on the basis of username/email
  if ((!username && !email) || typeof password !== "string" || !password) {
    throw new apiError(400, "Credentials are required.");
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
    throw new apiError(401, "Invalid email, username, or password.");
  }

  //Password Check
  const IsPasswordValid = await user.isPasswordCorrect(password);

  if (!IsPasswordValid) {
    throw new apiError(401, "Invalid email, username, or password.");
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

  return res
    .status(200)
    .cookie("accessToken", accessToken, authCookieOptions)
    .cookie("refreshToken", refreshToken, authCookieOptions)
    .json(
      new ResponseHandler(200, "User LoggedIn Successfully", {
        user: loggedIn,
      }),
    );
});

// 04
const forgotPassword = asyncHandler(async (req, res) => {
  const email = req.body?.email?.trim().toLowerCase();

  if (!email) {
    throw new apiError(400, "Email is required");
  }

  if (!EMAIL_PATTERN.test(email)) {
    throw new apiError(400, "Please provide a valid email address");
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+passwordResetOtpHash +passwordResetOtpExpires",
  );

  if (!user) {
    // Do not reveal whether an address is registered.
    return res
      .status(200)
      .json(
        new ResponseHandler(
          200,
          "If this email is registered, an OTP has been sent.",
          {},
        ),
      );
  }

  const otp = crypto.randomInt(0, 1000000).toString().padStart(6, "0");
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
    try {
      await user.save({ validateBeforeSave: false });
    } catch (rollbackError) {
      // Optionally log the rollback error for debugging
      if (!isProduction) {
        console.error("Failed to rollback OTP fields after email error:", rollbackError);
      }
    }
    throw error;
  }

  return res
    .status(200)
    .json(
      new ResponseHandler(200, "Password reset OTP sent to your email.", {}),
    );
});

// 05
const resetPassword = asyncHandler(async (req, res) => {
  const email = req.body?.email?.trim().toLowerCase();
  const otp = req.body?.otp?.trim();
  const newPassword = req.body?.newPassword;
  const confirmPassword = req.body?.confirmPassword;

  if (!email || !otp || !newPassword || !confirmPassword) {
    throw new apiError(
      400,
      "Email, OTP, and both password fields are required.",
    );
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
    throw new apiError(
      400,
      "The OTP is invalid or has expired. Request a new one.",
    );
  }

  user.password = newPassword;
  user.refreshTokens = [];
  user.passwordResetOtpHash = undefined;
  user.passwordResetOtpExpires = undefined;
  await user.save();

  // Automatically log the user in after password reset
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  return res
    .status(200)
    .cookie("accessToken", accessToken, authCookieOptions)
    .cookie("refreshToken", refreshToken, authCookieOptions)
    .json(new ResponseHandler(200, "Password reset successfully. You are now logged in.", {}));
});

// 06
const logoutUser = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (refreshToken) {
    const user = await User.findById(req.user._id);
    if (user && Array.isArray(user.refreshTokens)) {
      if (user.refreshTokens.includes(refreshToken)) {
        await User.findByIdAndUpdate(req.user._id, {
          $pull: { refreshTokens: refreshToken },
        });
      } else {
        if (!isProduction) {
          console.warn("Refresh token not found in user's refreshTokens array during logout.");
        }
      }
    }
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { refreshTokens: refreshToken },
    });
  }
  // All authentication cookies are cleared and the refresh token is removed from the database during logout.
    return res
      .status(200)
      .clearCookie("accessToken", authCookieOptions)
      .clearCookie("refreshToken", authCookieOptions)
      .json(new ResponseHandler(200, "User Logged Out", {}));
});

// 07
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;

  try {
    if (!incomingRefreshToken) {
      throw new apiError(401, "Invalid Refresh Token");
    }

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );
    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new apiError(401, "Invalid Refresh Token");
    }

    // Check if the refresh token exists in the user's refreshTokens array
    if (
      !Array.isArray(user.refreshTokens) ||
      !user.refreshTokens.includes(incomingRefreshToken)
    ) {
      throw new apiError(401, "Refresh token expired.");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id,
    );

    return res
      .status(200)
      .clearCookie("refreshToken", authCookieOptions)
      .cookie("accessToken", accessToken, authCookieOptions)
      .cookie("refreshToken", refreshToken, authCookieOptions)
      .json(
        new ResponseHandler(200, "Access token refreshed", {
          authenticated: true,
        }),
      );
  } catch (error) {
    if (error instanceof apiError) {
      throw error;
    }

    if (!isProduction) {
      console.error("Refresh token error:", error);
    }
    throw new apiError(401, "Invalid refresh token.");
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
  user.refreshToken = undefined;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ResponseHandler(200, "Password Has Been Changed.", {}));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Aggregate to get user with subscriber and video counts
  const userWithCounts = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(userId),
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
        from: "videos",
        localField: "_id",
        foreignField: "owner",
        as: "videos",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        videosCount: {
          $size: "$videos",
        },
        viewsCount: {
          $sum: "$videos.views",
        },
      },
    },
    {
      $project: {
        password: 0,
        refreshToken: 0,
        subscribers: 0,
        videos: 0,
        __v: 0,
      },
    },
  ]);

  const currentUser = userWithCounts[0] || req.user;

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
    { returnDocument: "after", runValidators: true },
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
      } catch {
        // The replacement upload succeeded; keep provider details out of logs.
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
      returnDocument: "after",
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
      } catch {
        // The replacement upload succeeded; keep provider details out of logs.
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
      returnDocument: "after",
    },
  ).select("-password -refreshToken");

  //todo: make a function to delete the previous image from cloudinary if user has already uploaded an image before.

  return res
    .status(200)
    .json(new ResponseHandler(200, "Cover Image updated successfully.", user));
});

const deleteUser = asyncHandler(async (req, res) => {
  //Todo: adduser verification via otp/password before deleting
  const user = await User.findByIdAndDelete(req.user._id);

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
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "owner",
        as: "videos",
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
        videosCount: {
          $size: "$videos",
        },
        viewsCount: {
          $sum: "$videos.views",
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
        createdAt: 1,
        videosCount: 1,
        viewsCount: 1,
      },
    },
  ]);
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

const toggleWatchlist = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid VideoID.");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new apiError(404, "Video not found.");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new apiError(404, "User not found.");
  }

  const alreadySaved = user.watchlist.some((id) => id.toString() === videoId);

  if (alreadySaved) {
    user.watchlist = user.watchlist.filter((id) => id.toString() !== videoId);
    user.watchlistDates.delete(videoId);
    await user.save();

    return res
      .status(200)
      .json(
        new ResponseHandler(
          200,
          "Video removed from watchlist.",
          user.watchlist,
        ),
      );
  }

  user.watchlist.push(videoId);
  user.watchlistDates.set(videoId, new Date());
  await user.save();

  return res
    .status(200)
    .json(
      new ResponseHandler(200, "Video added to watchlist.", user.watchlist),
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
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  const historyDates = user[0].watchHistoryDates || {};
  const watchHistory = user[0].watchHistory.map((video) => ({
    ...video,
    historyDate: historyDates[video._id] || null,
  }));

  return res
    .status(200)
    .json(new ResponseHandler(200, "Users WatchHistory", watchHistory));
});

const removeFromHistory = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!mongoose.isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid VideoID.");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { watchHistory: new mongoose.Types.ObjectId(videoId) },
      $unset: { [`watchHistoryDates.${videoId}`]: 1 },
    },
    { new: true },
  );
  if (!user) {
    throw new apiError(404, "User not found.");
  }

  return res
    .status(200)
    .json(
      new ResponseHandler(
        200,
        "Video removed from watch history.",
        user.watchHistory,
      ),
    );
});

const clearHistory = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { watchHistory: [], watchHistoryDates: {} } },
    { new: true },
  );
  if (!user) {
    throw new apiError(404, "User not found.");
  }

  return res
    .status(200)
    .json(
      new ResponseHandler(200, "Watch history cleared.", user.watchHistory),
    );
});
const getWatchlist = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchlist",
        foreignField: "_id",
        as: "watchlist",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        watchlist: {
          $map: {
            input: "$watchlist",
            as: "video",
            in: {
              $mergeObjects: [
                "$$video",
                {
                  watchlistAddedAt: {
                    $let: {
                      vars: {
                        watchlistDate: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: {
                                  $objectToArray: {
                                    $ifNull: ["$watchlistDates", {}],
                                  },
                                },
                                as: "entry",
                                cond: {
                                  $eq: [
                                    "$$entry.k",
                                    { $toString: "$$video._id" },
                                  ],
                                },
                              },
                            },
                            0,
                          ],
                        },
                      },
                      in: "$$watchlistDate.v",
                    },
                  },
                },
              ],
            },
          },
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ResponseHandler(200, "Users Watchlist", user[0]?.watchlist || []),
    );
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
  toggleWatchlist,
  getWatchHistory,
  removeFromHistory,
  clearHistory,
  getWatchlist,
};
