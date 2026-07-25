import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ResponseHandler } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const channelId = req.user?._id;
  //total video
  const totalVideo = await Video.countDocuments({ owner: channelId });
  //total views
  const totalViewCountResult = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $group: {
        _id: null,
        totalViews: {
          $sum: "$views",
        },
      },
    },
  ]);
  //total subscribers
  const subscribers = await Subscription.countDocuments({
    channel: channelId,
  });
  //total likes on video
  const likes = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $addFields: {
        likeCount: {
          $size: "$likes",
        },
      },
    },
    {
      $group: {
        _id: null,
        totalLikes: {
          $sum: "$likeCount",
        },
      },
    },
  ]);

  const totalViewCount = totalViewCountResult[0]?.totalViews || 0;
  const totalLikes = likes[0]?.totalLikes || 0;

  return res.status(200).json(
    new ResponseHandler(200, "Channel status fetched.", {
      totalVideo,
      totalViewCount,
      subscribers,
      totalLikes,
    }),
  );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
});

export { getChannelStats, getChannelVideos };
