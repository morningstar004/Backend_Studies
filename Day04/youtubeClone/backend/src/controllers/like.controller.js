import { apiError } from "../utils/apiError.js";
import { ResponseHandler } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comments.model.js";
import { Tweet } from "../models/tweets.model.js";
import { response } from "express";

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
  //TODO: toggle like on comment
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };
