import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { apiError } from "../utils/apiError.js";
import { ResponseHandler } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {User} from "../models/user.model.js"

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

  const matchCondition = { isPublished: true };

  if (typeof query === "string" && query.trim()) {
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
  const skip = (page - 1) * limit;

  const [result] = await Video.aggregate([
    { $match: matchCondition },
    { $sort: sortOptions },
    {
      $facet: {
        videos: [
          { $skip: skip },
          { $limit: limit },
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          { $set: { owner: { $first: "$owner" } } },
        ],
        metadata: [{ $count: "totalVideos" }],
      },
    },
  ]);

  const videos = result?.videos ?? [];
  const totalVideos = result?.metadata[0]?.totalVideos ?? 0;

  return res.status(200).json(
    new ResponseHandler(200, "Video Fetched Successfully", {
      videos,
      totalVideos,
      currentPage: page,
      totalPage: Math.ceil(totalVideos / limit),
    }),
  );
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid videoID.");
  }

  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: users,
        localField: owner,
        foreignField: _id,
        as: owner,
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1,
              coverImage: 1,
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
  ]);

  if(!video?.path){
    throw new apiError(404, "video not found")
  }

  await Video.findByIdAndUpdate(
    videoId,
    {
      $inc:{
        views: 1
      }
    }
  )

  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $addToSet:{
        watchHistory:1
      }
    }
  )

  return res
  .status(200)
  .json(new Response(200, "Videos Fetched succesfully", video[0]))
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
