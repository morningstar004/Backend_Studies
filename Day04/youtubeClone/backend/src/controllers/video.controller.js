import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { apiError } from "../utils/apiError.js";
import { ResponseHandler } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page: pageQuery = "1",
    limit: limitQuery = "10",
    query,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  const page = Number(pageQuery);
  const limit = Number(limitQuery);

  if (!Number.isInteger(page) || page < 1) {
    throw new apiError(400, "Page must be a positive integer");
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new apiError(400, "Limit must be an integer between 1 and 100");
  }

  const allowedSortFields = ["createdAt", "views", "title", "duration"];
  if (!allowedSortFields.includes(sortBy)) {
    throw new apiError(400, "Invalid sort field");
  }

  if (!["asc", "desc"].includes(sortType)) {
    throw new apiError(400, "Sort type must be asc or desc");
  }

  const matchCondition = {
    isPublished: true,
  };

  if (query?.trim()) {
    matchCondition.title = {
      $regex: query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      $options: "i",
    };
  }

  if (userId) {
    if (!isValidObjectId(userId)) {
      throw new apiError(400, "Invalid user id");
    }

    matchCondition.owner = new mongoose.Types.ObjectId(userId);
  }

  const sortOptions = { [sortBy]: sortType === "asc" ? 1 : -1, _id: -1 };

  const pipeline = [
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
      $sort: sortOptions,
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: limit,
    },
  ];

  const [videos, totalVideos] = await Promise.all([
    Video.aggregate(pipeline),
    Video.countDocuments(matchCondition),
  ]);

  return res.status(200).json(
    new ResponseHandler(200, "Video Fetched Successfully", {
      videos,
      totalVideos,
      currentPage: page,
      totalPage: Math.ceil(totalVideos / limit),
    }),
  );
});


export { getAllVideos };
