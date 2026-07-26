import { isValidObjectId } from "mongoose";
import { apiError } from "../utils/apiError.js";
import { ResponseHandler } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comments.model.js";
import { Video } from "../models/video.model.js";
import { comment } from "postcss";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const {
    page: pageQuery = "1",
    limit: limitQuery = "10",
    sortBy = "createdAt",
    sort = "desc",
    query,
  } = req.query;

  const page = Number(pageQuery);
  const limit = Number(limitQuery);

  if (!Number.isInteger(page) || page < 1) {
    throw new apiError(400, "Page must be a positive Integer.");
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new apiError(400, "Limit must be an integer between 1 and 100");
  }

  const allowedSortingFields = ["createdAt", "views", "title", "duration"];
  if (!allowedSortingFields.includes(sortBy)) {
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

  if (videoId) {
    if (!isValidObjectId(videoId)) {
      throw new apiError(400, "Invalid videoID.");
    }

    matchCondition.video = new mongoose.Types.ObjectId(videoId);
  }

  const sortOptions = { [sortBy]: sortType === "asc" ? 1 : -1, _id: -1 };
  const skip = (page - 1) * limit;

  const [result] = await Comment.aggregate([
    { $match: matchCondition },
    { $sort: sortOptions },
    {
      $facet: {
        videos: [
          { $skip: skip },
          { $limit: limit },
          {
            $lookup: {
              from: "Videos",
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

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const { content } = req.body;
  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid VideoID.");
  }

  if (typeof content !== "string" || content.trim() === "") {
    throw new apiError(400, "Can not send without can content.");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new apiError(404, "Video not Found.");
  }

  const comment = await Comment.create({
    owner: req.user?._id,
    content,
    video: videoId,
  });

  const createComment = await Comment.aggregate([
    {
      $match: {
        _id: comment._id,
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

  return res
    .status(201)
    .json(
      new ResponseHandler(200, "comment added successfully.", createComment[0]),
    );
});

const editComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;

  const { content } = req.body;

  if (!isValidObjectId(commentId)) {
    throw new apiError(400, "Invalid CommentID.");
  }

  if (typeof content !== "string" || content.trim() === "") {
    throw new apiError(400, "Please give some content.");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new apiError(404, "Comment not found.");
  }

  //ownerShip check
  if (comment.owner.toString() !== req.user?._id.toString()) {
    throw new apiError(403, "UserID is not Authorized to make changes.");
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content: content.trim(),
      },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  return res
    .status(200)
    .json(
      new ResponseHandler(200, "Comment Edited Successfully.", updatedComment),
    );
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  if (!isValidObjectId(commentId)) {
    throw new apiError(400, "Invalid CommentID.");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new apiError(404, "Comment not Found.");
  }

  //ownership
  if (comment.owner.toString() !== req.user?._id.toString()) {
    throw new apiError(403, "User not authorized to delete this comment.");
  }

  await Comment.findByIdAndDelete(commentId);

  return res
    .status(200)
    .json(new ResponseHandler(200, "Comment Deleted.", null));
});

export { getVideoComments, addComment, editComment, deleteComment };
