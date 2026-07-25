import { apiError } from "../utils/apiError.js";
import { ResponseHandler } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comments.model.js";
import { Tweet } from "../models/tweets.model.js";
import { foreignObject } from "framer-motion/client";
import { UNSAFE_ErrorResponseImpl } from "react-router-dom";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid VideoID.");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new apiError(404, "Video not found");
  }

  const alreadyLiked = await Like.findOne({
    video: videoId,
    likedBy: req.user?._id,
  });
  if (alreadyLiked) {
    await Like.findByIdAndDelete(alreadyLiked._id);
    return res
      .status(200)
      .json(new ResponseHandler(200, "Video Unliked successfully.", null));
  }

  const like = await Like.create({
    video: videoId,
    likedBy: req.user._id,
  });

  return res
    .status(201)
    .json(new ResponseHandler(201, "Video liked successfully", like));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!isValidObjectId(commentId)) {
    throw new apiError(400, "Invalid CommentID.");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new apiError(404, "Comment not found.");
  }

  const alreadyLiked = await Like.findOne({
    comment: commentId,
    likedBy: req.user?._id,
  });

  if (alreadyLiked) {
    await Like.findByIdAndDelete(alreadyLiked._id);
    return res
      .status(200)
      .json(new ResponseHandler(200, "Comment Unliked successfully.", null));
  }

  const like = await Like.create({
    comment: commentId,
    likedBy: req.user?._id,
  });

  return res
    .status(201)
    .json(new ResponseHandler(201, "Comment Liked successfully.", like));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!isValidObjectId(tweetId)) {
    throw new apiError(400, "Invalid TweetID.");
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new apiError(404, "Tweet not found.");
  }

  const alreadyLiked = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user?._id,
  });

  if (alreadyLiked) {
    await Like.findByIdAndDelete(alreadyLiked._id);
    return res
      .status(200)
      .json(new ResponseHandler(200, "tweet Unliked successfully.", null));
  }

  const like = await Like.create({
    tweet: tweetId,
    likedBy: req.user?._id,
  });

  return res
    .status(201)
    .json(new ResponseHandler(201, "Tweet Liked successfully.", like));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const videoId = req.user?._id;
  if (!videoId) {
    throw new apiError(400, "VideoID not found.");
  }
  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(videoId),
      },
      video: {
        $exists: true,
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "Videos",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localStorage: "owner",
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
              ],
            },
          },
        ],
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        avatar: 1,
        subscribersCount: 1,
        isSubscribed: 1,
      },
    },
    {
      $addFields: {
        likedVideos: {
          $frist: "$video",
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(new ResponseHandler(200, "Liked Video Fetched.", likedVideos));
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };
