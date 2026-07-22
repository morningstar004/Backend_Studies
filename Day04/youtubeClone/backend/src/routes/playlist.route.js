import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylists,
  removeVideoFromPlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";

const router = Router();

router.route("/createPlaylist").post(verifyJWT, createPlaylist);
router.route("/getUserPlaylists").get(verifyJWT, getUserPlaylists);
router.route("/getPlaylistById").get(verifyJWT, getPlaylistById);
router.route("/addVideoToPlaylist").patch(verifyJWT, addVideoToPlaylist);
router
  .route("/removeVideoFromPlaylist")
  .delete(verifyJWT, removeVideoFromPlaylist);
router.route("/deletePlaylist").delete(verifyJWT, deletePlaylist);
router.route("/updatePlaylist").patch(verifyJWT, updatePlaylist);

export { router as playlistRouter };
