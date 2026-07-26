import { isValidObjectId } from "mongoose";
import { apiError } from "../utils/apiError.js";
import { ResponseHandler } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  //TODO: create playlist
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
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
  //TODO: update playlist
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
