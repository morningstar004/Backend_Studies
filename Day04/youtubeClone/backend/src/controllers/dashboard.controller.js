import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { View } from "../models/view.model.js";
import { apiError } from "../utils/apiError.js";
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
  const videos = await Video.find({ owner: req.user._id })
    .sort({ createdAt: -1 })
    .lean();

  return res
    .status(200)
    .json(new ResponseHandler(200, "Channel videos fetched.", videos));
});

const getChannelViewEngagement = asyncHandler(async (req, res) => {
  const range = req.query.range ?? "month";
  const ranges = {
    "6hour": { bucket: "hour", amount: 6, unit: "hour" },
    day: { bucket: "hour", amount: 24, unit: "hour" },
    week: { bucket: "day", amount: 7, unit: "day" },
    month: { bucket: "day", amount: 30, unit: "day" },
    "3month": { bucket: "week", amount: 3, unit: "month" },
    year: { bucket: "month", amount: 12, unit: "month" },
    all: { bucket: "month" },
  };
  const selectedRange = ranges[range];

  if (!selectedRange) {
    throw new apiError(400, "Invalid engagement range.");
  }

  const now = new Date();
  let startDate;
  if (range === "all") {
    const firstView = await View.findOne({ channel: req.user._id })
      .sort({ createdAt: 1 })
      .select("createdAt")
      .lean();
    startDate = firstView?.createdAt;
  } else if (range === "year") {
    startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));
  } else {
    startDate = new Date(now);
    if (selectedRange.unit === "hour") {
      startDate.setUTCHours(startDate.getUTCHours() - selectedRange.amount);
    } else if (selectedRange.unit === "day") {
      startDate.setUTCDate(startDate.getUTCDate() - selectedRange.amount);
    } else {
      startDate.setUTCMonth(startDate.getUTCMonth() - selectedRange.amount);
    }
  }

  if (!startDate) {
    return res
      .status(200)
      .json(new ResponseHandler(200, "Channel view engagement fetched.", []));
  }

  const firstBucketDate = new Date(startDate);
  if (selectedRange.bucket === "hour") {
    firstBucketDate.setUTCMinutes(0, 0, 0);
  } else if (selectedRange.bucket === "day") {
    firstBucketDate.setUTCHours(0, 0, 0, 0);
  } else if (selectedRange.bucket === "week") {
    firstBucketDate.setUTCHours(0, 0, 0, 0);
    firstBucketDate.setUTCDate(
      firstBucketDate.getUTCDate() - ((firstBucketDate.getUTCDay() + 6) % 7),
    );
  } else if (selectedRange.bucket === "month") {
    firstBucketDate.setUTCDate(1);
    firstBucketDate.setUTCHours(0, 0, 0, 0);
  }

  const dailyViews = await View.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(req.user._id),
        createdAt: { $gte: startDate, $lte: now },
      },
    },
    {
      $group: {
        _id: {
          $dateTrunc: {
            date: "$createdAt",
            unit: selectedRange.bucket,
            timezone: "UTC",
            ...(selectedRange.bucket === "week" ? { startOfWeek: "monday" } : {}),
          },
        },
        views: { $sum: 1 },
      },
    },
  ]);
  const viewsByDate = new Map(
    dailyViews.map(({ _id, views }) => [_id.toISOString(), views]),
  );
  const buckets = [];
  for (const date = firstBucketDate; date <= now; ) {
    const dateKey = date.toISOString();
    buckets.push({ date: dateKey, views: viewsByDate.get(dateKey) ?? 0 });
    const nextDate = new Date(date);
    if (selectedRange.bucket === "hour") {
      nextDate.setUTCHours(nextDate.getUTCHours() + 1);
    } else if (selectedRange.bucket === "day") {
      nextDate.setUTCDate(nextDate.getUTCDate() + 1);
    } else if (selectedRange.bucket === "week") {
      nextDate.setUTCDate(nextDate.getUTCDate() + 7);
    } else {
      nextDate.setUTCMonth(nextDate.getUTCMonth() + 1);
    }
    date.setTime(nextDate.getTime());
  }

  return res
    .status(200)
    .json(new ResponseHandler(200, "Channel view engagement fetched.", buckets));
});

export { getChannelStats, getChannelVideos, getChannelViewEngagement };
