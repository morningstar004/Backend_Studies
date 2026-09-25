import { Router } from "express";
import {
  getLikedVideos,
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoDislike,
  toggleVideoLike,
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/toggleVideoLike/:videoId").patch(verifyJWT, toggleVideoLike);
router.route("/toggleVideoDislike/:videoId").patch(verifyJWT, toggleVideoDislike);
router.route("/toggleCommentLike/:commentId").patch(verifyJWT, toggleCommentLike);
router.route("/toggleTweetLike/:tweetId").patch(verifyJWT, toggleTweetLike);
router.route("/getLikedVideos").get(verifyJWT, getLikedVideos);

export { router as likeRouter };
