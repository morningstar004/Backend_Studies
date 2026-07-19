import mongoose, { Schema, isValidObjectId } from "mongoose";
import { Video } from "../models/video.model";
import { apiError } from "../utils/apiError.js";
import { ResponseHandler } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createAt",
    sortType = "desc",
    userId,
  } = req.body;

  const matchCondition = {
    isPublised: true,
  };

  if (query) {
    matchCondition.title = {
      $regex: query,
      $options: "i",
    };
  }

  if (userId && isValidObjectId(userId)) {
    matchCondition.owner = new mongoose.Types.ObjectId(userId);
  }

  const sortOptions = {};

  sortOptions[sortBy] = sortType === "asc" ? 1 : -1;

  const videos = await Video.aggregate([
    {
      $match: matchCondition,
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: {
          $project: {
            username: 1,
            fullName: 1,
            avatar: 1,
          },
        },
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
    {
      $sort: {
        sortOptions,
      },
    },
    {
      $skip: (Number(page) - 1) * Number(limit),
    },
    {
      $limit: Number(limit),
    },
  ]);

  const totalVideos = await Video.countDocuments(matchCondition);

  return res.status(200).json(
    new ResponseHandler(200, "Video Fetched Successfully", {
      videos,
      totalVideos,
      currentPage: Number(page),
      totalPage: Math.ceil(totalVideos / limit),
    }),
  );
});
