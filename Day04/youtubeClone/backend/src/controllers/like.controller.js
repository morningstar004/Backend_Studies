import { apiError } from "../utils/apiError.js";
import { ResponseHandler } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comments.model.js";
import { Tweet } from "../models/tweets.model.js";

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

  const existingReaction = await Like.findOne({
    video: videoId,
    likedBy: req.user?._id,
  });
  if (existingReaction && !existingReaction.isDislike) {
    await Like.findByIdAndDelete(existingReaction._id);
    return res
      .status(200)
      .json(new ResponseHandler(200, "Video Unliked successfully.", null));
  }

  const like = existingReaction
    ? await Like.findByIdAndUpdate(
        existingReaction._id,
        { $set: { isDislike: false } },
        { new: true },
      )
    : await Like.create({ video: videoId, likedBy: req.user._id });

  return res
    .status(201)
    .json(new ResponseHandler(201, "Video liked successfully", like));
});

const toggleVideoDislike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid VideoID.");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new apiError(404, "Video not found");
  }

  const existingReaction = await Like.findOne({
    video: videoId,
    likedBy: req.user?._id,
  });

  if (existingReaction?.isDislike) {
    await Like.findByIdAndDelete(existingReaction._id);
    return res
      .status(200)
      .json(
        new ResponseHandler(200, "Video dislike removed successfully.", null),
      );
  }

  const dislike = existingReaction
    ? await Like.findByIdAndUpdate(
        existingReaction._id,
        { $set: { isDislike: true } },
        { new: true },
      )
    : await Like.create({
        video: videoId,
        likedBy: req.user._id,
        isDislike: true,
      });

  return res
    .status(201)
    .json(new ResponseHandler(201, "Video disliked successfully", dislike));
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

  const existingReaction = await Like.findOne({
    comment: commentId,
    likedBy: req.user?._id,
  });

  if (existingReaction && !existingReaction.isDislike) {
    await Like.findByIdAndDelete(existingReaction._id);
    return res
      .status(200)
      .json(new ResponseHandler(200, "Comment Unliked successfully.", null));
  }

  const like = existingReaction
    ? await Like.findByIdAndUpdate(
        existingReaction._id,
        { $set: { isDislike: false } },
        { new: true },
      )
    : await Like.create({ comment: commentId, likedBy: req.user._id });

  return res
    .status(201)
    .json(new ResponseHandler(201, "Comment Liked successfully.", like));
});

const toggleCommentDislike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!isValidObjectId(commentId)) {
    throw new apiError(400, "Invalid CommentID.");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new apiError(404, "Comment not found.");
  }

  const existingReaction = await Like.findOne({
    comment: commentId,
    likedBy: req.user?._id,
  });

  if (existingReaction?.isDislike) {
    await Like.findByIdAndDelete(existingReaction._id);
    return res
      .status(200)
      .json(
        new ResponseHandler(200, "Comment dislike removed successfully.", null),
      );
  }

  const dislike = existingReaction
    ? await Like.findByIdAndUpdate(
        existingReaction._id,
        { $set: { isDislike: true } },
        { new: true },
      )
    : await Like.create({
        comment: commentId,
        likedBy: req.user._id,
        isDislike: true,
      });

  return res
    .status(201)
    .json(new ResponseHandler(201, "Comment disliked successfully.", dislike));
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
  const userId = req.user?._id;
  if (!userId) {
    throw new apiError(401, "User not authenticated.");
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);

  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: userObjectId,
        video: { $exists: true },
        isDislike: { $ne: true },
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
        pipeline: [
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
                  $addFields: {
                    subscribersCount: { $size: "$subscribers" },
                    isSubscribed: {
                      $in: [userObjectId, "$subscribers.subscriber"],
                    },
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
              ],
            },
          },
          {
            $addFields: {
              owner: { $first: "$owner" },
            },
          },
        ],
      },
    },
    {
      $unwind: "$video",
    },
    {
      $project: {
        _id: 0,
        video: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ResponseHandler(200, "Liked Video Fetched.", likedVideos));
});

export {
  toggleVideoLike,
  toggleVideoDislike,
  toggleCommentLike,
  toggleCommentDislike,
  toggleTweetLike,
  getLikedVideos,
};
