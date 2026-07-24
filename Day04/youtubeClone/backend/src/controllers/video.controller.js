import mongoose, { isValidObjectId } from "mongoose";
import { unlink } from "node:fs/promises";
import { Video } from "../models/video.model.js";
import { apiError } from "../utils/apiError.js";
import { ResponseHandler } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

const removeTemporaryFiles = async (paths) => {
  await Promise.allSettled(
    paths.filter(Boolean).map((filePath) => unlink(filePath)),
  );
};

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
  const videoLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (
    typeof title !== "string" ||
    typeof description !== "string" ||
    !title.trim() ||
    !description.trim()
  ) {
    await removeTemporaryFiles([videoLocalPath, thumbnailLocalPath]);
    throw new apiError(400, "Title and description are required");
  }

  if (!videoLocalPath) {
    throw new apiError(400, "Video file required");
  }

  if (!thumbnailLocalPath) {
    throw new apiError(400, "Thumbnail file required");
  }

  const videoData = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoData) {
    throw new apiError(500, "Error video not uploaded");
  }
  if (!thumbnail) {
    throw new apiError(500, "Error thumbnail not uploaded");
  }

  const video = await Video.create({
    videoFile: videoData.url,
    thumbnail: thumbnail.url,
    owner: req.user._id,
    title: title.trim(),
    description: description.trim(),
    duration: videoData.duration || 0,
    isPublished: true,
  });

  const uploadedVideo = await Video.findById(video._id);

  if (!uploadedVideo) {
    throw new apiError(500, "Video Upload failed to database.");
  }

  return res
    .status(200)
    .json(
      new ResponseHandler(200, "Video Uploaded to Cloudinary.", uploadedVideo),
    );
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid videoID.");
  }

  const [video] = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
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

  if (!video) {
    throw new apiError(404, "Video not found");
  }

  const [updatedVideo] = await Promise.all([
    Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } }, { new: true }),
    User.findByIdAndUpdate(req.user._id, {
      $addToSet: { watchHistory: video._id },
    }),
  ]);

  video.views = updatedVideo.views;

  return res
    .status(200)
    .json(new ResponseHandler(200, "Video fetched successfully", video));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid videoID.");
  }
  //TODO: update video details like title, description, thumbnail
  const { title, description } = req.body ?? {};

  if (!title || !description) {
    throw new apiError(400, "All the attributes should be filled");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new apiError(404, "Video not Found.");
  }

  //check ownership
  if (video.owner.toString() !== req.user?._id.toString()) {
    throw new apiError(403, "Not authorized to made any changes.");
  }

  let thumbnailUrl = video.thumbnail;

  if (req.file?.path) {
    const thumbnail = await uploadOnCloudinary(req.file?.path);

    if (!thumbnail.url) {
      throw new apiError(500, "thumbnail is not updated.");
    }

    thumbnailUrl = thumbnail.url;
  }

  const videoInfo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title: title.trim(),
        description: description.trim(),
        thumbnail: thumbnailUrl,
      },
    },
    {
      new: true,
    },
  );

  return res
    .status(200)
    .json(
      new ResponseHandler(
        200,
        "video information has been updated.",
        videoInfo,
      ),
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid VideoID.");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new apiError(404, "Video not found.");
  }

  if (video.owner.toString() !== req.user?._id.toString()) {
    throw new apiError(403, "Not Authorized to delete this video.");
  }

  const videoFile = video.videoFile;
  const thumbnailFile = video.thumbnail;

  if (!videoFile) {
    throw new apiError(404, "Video URL not found.");
  }

  if (!thumbnailFile) {
    throw new apiError(404, "Thumbnail URL not found.");
  }

  const [videoDelete, thumbnailDelete] = await Promise.all([
    deleteFromCloudinary(videoFile),
    deleteFromCloudinary(thumbnailFile),
  ]);

  if (!videoDelete || !thumbnailDelete) {
    throw new apiError(500, "Failed to delete video files from Cloudinary.");
  }

  await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(
      new ResponseHandler(200, "Video and thumbnail have been deleted.", {
        videoDelete,
        thumbnailDelete,
      }),
    );
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid VideoID.");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new apiError(404, "Video not found.");
  }

  if (video.owner.toString() !== req.user?._id.toString()) {
    throw new apiError(403, "Not authorized to change publish status.");
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    { $set: { isPublished: !video.isPublished } },
    { new: true },
  );

  return res
    .status(200)
    .json(new ResponseHandler(200, "Publish status toggled.", updatedVideo));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
