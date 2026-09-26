import mongoose, { isValidObjectId } from "mongoose";
import { unlink } from "node:fs/promises";
import { Tweet } from "../models/tweets.model.js";
import { User } from "../models/user.model.js";
import { apiError } from "../utils/apiError.js";
import { ResponseHandler } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

const removeTemporaryFile = async (filePath) => {
  if (filePath) {
    await unlink(filePath).catch(() => {});
  }
};

const createTweet = asyncHandler(async (req, res) => {
  const { caption } = req.body;
  if (typeof caption !== "string" || caption.trim() === "") {
    await removeTemporaryFile(req.file?.path);
    throw new apiError(400, "Caption is required to Tweet.");
  }

  const image = req.file?.path
    ? await uploadOnCloudinary(req.file.path)
    : null;

  const tweet = await Tweet.create({
    caption: caption.trim(),
    imageContent: image?.url ?? null,
    owner: req.user?._id,
  });

  const createTweent = await Tweet.aggregate([
    {
      $match: {
        _id: tweet?._id,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
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
              subscriberCount: {
                $size: "$subscribers",
              },
              subscribedChannelsCount: {
                $size: "$subscribedTo",
              },
              isSubscribed: {
                $cond: {
                  if: {
                    $in: [req.user?._id, "$subscribers.subscriber"],
                  },
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
              avatar: 1,
              subscribersCount: 1,
              channelsSubscribedToCount: 1,
              isSubscribed: 1,
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

  return res
    .status(200)
    .json(new ResponseHandler(200, "Tweet Created", createTweent));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) {
    throw new apiError(400, "Invalid UserID.");
  }

  const tweets = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
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
              subscriberCount: {
                $size: "$subscribers",
              },
              subscribedChannelsCount: {
                $size: "$subscribedTo",
              },
              isSubscribed: {
                $cond: {
                  if: {
                    $in: [req.user?._id, "$subscribers.subscriber"],
                  },
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
              avatar: 1,
              subscriberCount: 1,
              subscribedChannelsCount: 1,
              isSubscribed: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: { $first: "$owner" },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ResponseHandler(200, "Tweets Fetched Successfully", tweets));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { caption } = req.body ?? {};

  if (!isValidObjectId(tweetId)) {
    await removeTemporaryFile(req.file?.path);
    throw new apiError(400, "Invalid TweetId.");
  }

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    await removeTemporaryFile(req.file?.path);
    throw new apiError(404, "Tweet not found.");
  }

  if (typeof caption !== "string" || caption.trim() === "") {
    await removeTemporaryFile(req.file?.path);
    throw new apiError(400, "Caption is required.");
  }

  if (tweet.owner.toString() !== req.user?._id.toString()) {
    await removeTemporaryFile(req.file?.path);
    throw new apiError(403, "Not authorized to make changes.");
  }

  const image = req.file?.path
    ? await uploadOnCloudinary(req.file.path)
    : null;

  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        caption: caption.trim(),
        ...(image && { imageContent: image.url }),
      },
    },
    {
      returnDocument: "after",
      runValidators: true,
    },
  );

  if (image && tweet.imageContent) {
    await deleteFromCloudinary(tweet.imageContent);
  }

  return res
    .status(200)
    .json(new ResponseHandler(200, "Tweet Updated", updatedTweet));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new apiError(400, "Invalid TweetId.");
  }

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new apiError(404, "Tweet not found.");
  }

  if (tweet.owner.toString() !== req.user?._id.toString()) {
    throw new apiError(403, "Not authorized to delete this tweet.");
  }

  const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

  return res
    .status(200)
    .json(new ResponseHandler(200, "Tweet deleted.", deletedTweet));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
