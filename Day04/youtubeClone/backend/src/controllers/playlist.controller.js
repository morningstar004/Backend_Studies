import mongoose, { isValidObjectId } from "mongoose";
import { apiError } from "../utils/apiError.js";
import { ResponseHandler } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (typeof name !== "string" || name.trim().length < 3) {
    throw new apiError(400, "Playlist name must be at least 3 characters.");
  }

  const playlistInfo = { name: name.trim() };
  if (description !== undefined) {
    if (typeof description !== "string" || description.trim().length < 10) {
      throw new apiError(400, "Description must be at least 10 characters.");
    }
    playlistInfo.description = description.trim();
  }

  const playlist = await Playlist.create({
    ...playlistInfo,
    owner: req.user?._id,
  });

  return res
    .status(201)
    .json(
      new ResponseHandler(
        201,
        `New playlist created: ${playlist.name}.`,
        playlist,
      ),
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  if (!isValidObjectId(userId)) {
    throw new apiError(400, "Invalid UserID.");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new apiError(404, "User not found.");
  }

  //check ownership
  if (user._id.toString() !== req.user?._id.toString()) {
    throw new apiError(403, "User not authorized to fetch playlists");
  }

  const playlists = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",

        pipeline: [
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
        ],
      },
    },
    {
      $addFields: {
        totalVideos: {
          $size: "$videos",
        },
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ResponseHandler(200, "User playlists fetched successfully.", playlists));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new apiError(400, "Invalid PlaylistID.");
  }

  const playlist = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId),
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
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
        pipeline: [
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
        ],
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
        totalVideos: {
          $size: "$videos",
        },
      },
    },
  ]);

  const playlistDetails = playlist[0];
  if (!playlistDetails) {
    throw new apiError(404, "Playlist not found.");
  }

  return res
    .status(200)
    .json(
      new ResponseHandler(
        200,
        `Fetched the playlist ${playlistDetails.name}.`,
        playlistDetails,
      ),
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid Playlist Or Video Id.");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new apiError(404, "Playlist not Found.");
  }
  //owner check
  if (playlist.owner.toString() !== req.user?._id.toString()) {
    throw new apiError(403, "User not authorized to add videos.");
  }

  const video = await Video.exists({ _id: videoId });
  if (!video) {
    throw new apiError(404, "Video not found.");
  }

  const addVideo = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $addToSet: {
        videos: videoId,
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
        `New video added to playlist (${playlist.name}).`,
        addVideo,
      ),
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new apiError(400, "Invalid Playlist and Video ID.");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new apiError(404, "Playlist not Found.");
  }
  //check ownerShip
  if (playlist.owner.toString() !== req.user?._id.toString()) {
    throw new apiError(403, "User not authorized to remove videos");
  }
  const removeVideo = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        videos: videoId,
      },
    },
    {
      new: true,
    },
  );

  return res
    .status(200)
    .json(
      new ResponseHandler(200, "Video removed from the Playlist.", removeVideo),
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  if (!isValidObjectId(playlistId)) {
    throw new apiError(400, "Invalid Playlist.");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new apiError(404, "playlist not found.");
  }

  //owner verification
  if (playlist.owner.toString() !== req.user?._id.toString()) {
    throw new apiError(403, "User not authorized to delete the playlist.");
  }

  await Playlist.findByIdAndDelete(playlistId);

  return res
    .status(200)
    .json(new ResponseHandler(200, "Playlist Deleted.", null));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  if (!isValidObjectId(playlistId)) {
    throw new apiError(400, "Invalid PlaylistID.");
  }

  const updates = {};
  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length < 3) {
      throw new apiError(400, "Playlist name must be at least 3 characters.");
    }
    updates.name = name.trim();
  }
  if (description !== undefined) {
    if (typeof description !== "string" || description.trim().length < 10) {
      throw new apiError(400, "Description must be at least 10 characters.");
    }
    updates.description = description.trim();
  }
  if (Object.keys(updates).length === 0) {
    throw new apiError(400, "Provide a name or description to update.");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new apiError(404, "Playlist not found.");
  }

  //check ownership
  if (playlist.owner.toString() !== req.user?._id.toString()) {
    throw new apiError(403, "User not authorized to update the playlist.");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    { $set: updates },
    {
      new: true,
      runValidators: true,
    },
  );

  return res
    .status(200)
    .json(
      new ResponseHandler(
        200,
        `Playlist ${updatedPlaylist.name} updated.`,
        updatedPlaylist,
      ),
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
