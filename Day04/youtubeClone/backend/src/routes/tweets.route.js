import {Router} from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweets.controller.js";

const router = Router();

router.route("/createTweet").post(verifyJWT,createTweet);
router.route("/getUserTweets/:userId").get(verifyJWT,getUserTweets);
router.route("/updateTweet").patch(verifyJWT,updateTweet);
router.route("/deleteTweet").delete(verifyJWT,deleteTweet);

export {router as tweetsRouter}
