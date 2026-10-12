import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  createTweet,
  deleteTweet,
  getUserTweets,
  updateTweet,
} from "../controllers/tweets.controller.js";
import {
  addTweetComment,
  getTweetComments,
} from "../controllers/comments.controller.js";

const router = Router();

router
  .route("/createTweet")
  .post(verifyJWT, upload.array("imageContent", 10), createTweet);
router.route("/getUserTweets/:userId").get(verifyJWT, getUserTweets);
router.route("/getTweetComments/:tweetId").get(verifyJWT, getTweetComments);
router.route("/addTweetComment/:tweetId").post(verifyJWT, addTweetComment);
router
  .route("/updateTweet/:tweetId")
  .patch(verifyJWT, upload.single("imageContent"), updateTweet);
router.route("/deleteTweet/:tweetId").delete(verifyJWT, deleteTweet);

export { router as tweetsRouter };
