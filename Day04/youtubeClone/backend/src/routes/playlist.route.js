import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  togglePlaylistPublishStatus,
  updatePlaylist,
} from "../controllers/playlist.controller.js";

const router = Router();

router.route("/createPlaylist").post(verifyJWT, createPlaylist);
router.route("/:userId/getUserPlaylists").get(verifyJWT, getUserPlaylists);
router.route("/:playlistId/getPlaylistById").get(verifyJWT, getPlaylistById);
router
  .route("/:playlistId/addVideoToPlaylist/:videoId")
  .patch(verifyJWT, addVideoToPlaylist);
router
  .route("/:playlistId/removeVideoFromPlaylist/:videoId")
  .delete(verifyJWT, removeVideoFromPlaylist);
router.route("/:playlistId/deletePlaylist").delete(verifyJWT, deletePlaylist);
router.route("/:playlistId/updatePlaylist").patch(verifyJWT, updatePlaylist);
router
  .route("/:playlistId/togglePublishStatus")
  .patch(verifyJWT, togglePlaylistPublishStatus);

export { router as playlistRouter };
