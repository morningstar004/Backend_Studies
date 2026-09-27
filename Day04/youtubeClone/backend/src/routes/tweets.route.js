import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  createTweet,
  deleteTweet,
  getUserTweets,
  updateTweet,
} from "../controllers/tweets.controller.js";

const router = Router();

router
  .route("/createTweet")
  .post(verifyJWT, upload.single("imageContent"), createTweet);
router.route("/getUserTweets/:userId").get(verifyJWT, getUserTweets);
router
  .route("/updateTweet/:tweetId")
  .patch(verifyJWT, upload.single("imageContent"), updateTweet);
router.route("/deleteTweet/:tweetId").delete(verifyJWT, deleteTweet);

export { router as tweetsRouter };
