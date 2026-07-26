import { isValidObjectId } from "mongoose";
import { apiError } from "../utils/apiError.js";
import { ResponseHandler } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comments.model.js";
import { Video } from "../models/video.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
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
