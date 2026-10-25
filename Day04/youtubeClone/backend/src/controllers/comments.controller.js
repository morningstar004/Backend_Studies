import mongoose, { isValidObjectId } from "mongoose";
import { apiError } from "../utils/apiError.js";
import { ResponseHandler } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comments.model.js";
import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweets.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid VideoID.");
  }

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  if (!Number.isInteger(pageNumber) || pageNumber < 1) {
    throw new apiError(400, "Page must be a positive integer.");
  }
  if (!Number.isInteger(limitNumber) || limitNumber < 1 || limitNumber > 100) {
    throw new apiError(400, "Limit must be an integer between 1 and 100.");
  }

  const video = await Video.exists({ _id: videoId });
  if (!video) {
    throw new apiError(404, "Video not found.");
  }

  const commentsAggregate = Comment.aggregate([
    { $match: { video: new mongoose.Types.ObjectId(videoId) } },
    { $sort: { createdAt: -1, _id: -1 } },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          { $project: { username: 1, fullName: 1, avatar: 1 } },
        ],
      },
    },
    { $set: { owner: { $first: "$owner" } } },
    {
      $lookup: {
        from: "likes",
        let: {
          commentId: "$_id",
          userId: new mongoose.Types.ObjectId(req.user._id),
        },
        pipeline: [
          { $match: { $expr: { $eq: ["$comment", "$$commentId"] } } },
          {
            $group: {
              _id: null,
              likeCount: {
                $sum: { $cond: [{ $ne: ["$isDislike", true] }, 1, 0] },
              },
              dislikeCount: {
                $sum: { $cond: [{ $eq: ["$isDislike", true] }, 1, 0] },
              },
              isLiked: {
                $max: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ["$likedBy", "$$userId"] },
                        { $ne: ["$isDislike", true] },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
              isDisliked: {
                $max: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ["$likedBy", "$$userId"] },
                        { $eq: ["$isDislike", true] },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
            },
          },
        ],
        as: "reactionStats",
      },
    },
    {
      $set: {
        reactionStats: {
          $ifNull: [
            { $first: "$reactionStats" },
            { likeCount: 0, dislikeCount: 0, isLiked: 0, isDisliked: 0 },
          ],
        },
      },
    },
    {
      $set: {
        likeCount: "$reactionStats.likeCount",
        dislikeCount: "$reactionStats.dislikeCount",
        isLiked: { $eq: ["$reactionStats.isLiked", 1] },
        isDisliked: { $eq: ["$reactionStats.isDisliked", 1] },
      },
    },
    { $project: { reactionStats: 0 } },
  ]);

  const comments = await Comment.aggregatePaginate(commentsAggregate, {
    page: pageNumber,
    limit: limitNumber,
  });

  return res
    .status(200)
    .json(new ResponseHandler(200, "Video comments fetched successfully.", comments));
});

const getCurrentUserComments = asyncHandler(async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);

  if (!Number.isInteger(page) || page < 1) {
    throw new apiError(400, "Page must be a positive integer.");
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new apiError(400, "Limit must be an integer between 1 and 100.");
  }

  const commentsAggregate = Comment.aggregate([
    { $match: { owner: new mongoose.Types.ObjectId(req.user._id) } },
    { $sort: { createdAt: -1, _id: -1 } },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
        pipeline: [{ $project: { title: 1, thumbnail: 1 } }],
      },
    },
    {
      $lookup: {
        from: "tweets",
        localField: "tweet",
        foreignField: "_id",
        as: "tweet",
        pipeline: [{ $project: { caption: 1 } }],
      },
    },
    {
      $set: {
        video: { $first: "$video" },
        tweet: { $first: "$tweet" },
      },
    },
    {
      $project: {
        content: 1,
        createdAt: 1,
        video: 1,
        tweet: 1,
      },
    },
  ]);
  const comments = await Comment.aggregatePaginate(commentsAggregate, {
    page,
    limit,
  });

  return res
    .status(200)
    .json(new ResponseHandler(200, "Your comments fetched successfully.", comments));
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

const getTweetComments = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!isValidObjectId(tweetId)) {
    throw new apiError(400, "Invalid TweetID.");
  }

  const tweet = await Tweet.exists({ _id: tweetId });
  if (!tweet) {
    throw new apiError(404, "Tweet not found.");
  }

  const comments = await Comment.aggregate([
    { $match: { tweet: new mongoose.Types.ObjectId(tweetId) } },
    { $sort: { createdAt: -1, _id: -1 } },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [{ $project: { username: 1, fullName: 1, avatar: 1 } }],
      },
    },
    { $set: { owner: { $first: "$owner" } } },
  ]);

  return res
    .status(200)
    .json(new ResponseHandler(200, "Tweet comments fetched successfully.", comments));
});

const addTweetComment = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body ?? {};

  if (!isValidObjectId(tweetId)) {
    throw new apiError(400, "Invalid TweetID.");
  }
  if (typeof content !== "string" || content.trim() === "") {
    throw new apiError(400, "Comment content is required.");
  }
  if (content.trim().length > 1000) {
    throw new apiError(400, "Comment cannot exceed 1000 characters.");
  }

  const tweet = await Tweet.exists({ _id: tweetId });
  if (!tweet) {
    throw new apiError(404, "Tweet not found.");
  }

  const createdComment = await Comment.create({
    owner: req.user?._id,
    content: content.trim(),
    tweet: tweetId,
  });
  const [comment] = await Comment.aggregate([
    {
      $match: {
        _id: createdComment._id,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [{ $project: { username: 1, fullName: 1, avatar: 1 } }],
      },
    },
    { $set: { owner: { $first: "$owner" } } },
  ]);

  return res
    .status(201)
    .json(new ResponseHandler(201, "Tweet comment added successfully.", comment));
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
      returnDocument: "after",
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

export {
  getVideoComments,
  getCurrentUserComments,
  addComment,
  getTweetComments,
  addTweetComment,
  editComment,
  deleteComment,
};
