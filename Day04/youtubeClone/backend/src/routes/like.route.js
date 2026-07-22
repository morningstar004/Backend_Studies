import { Router } from "express";
import {
  getLikedVideos,
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/toggleVideoLike").patch(verifyJWT, toggleVideoLike);
router.route("/toggleCommentLike").patch(verifyJWT, toggleCommentLike);
router.route("/toggleTweetLike").patch(verifyJWT, toggleTweetLike);
router.route("/getLikedVideos").get(verifyJWT, getLikedVideos);

export { router as likeRouter };
