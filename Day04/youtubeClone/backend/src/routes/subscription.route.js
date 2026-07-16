import {Router} from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannel
} from "../controllers/subscription.controller.js";
const router = Router();

router.route("/:channelId").patch(verifyJWT, toggleSubscription);
router
  .route("/:channelId/subscribers")
  .get(verifyJWT, getUserChannelSubscribers);

router.route("/:channelId/subscriptions").get(verifyJWT, getSubscribedChannel)
export {router as subscriptionRouter}
