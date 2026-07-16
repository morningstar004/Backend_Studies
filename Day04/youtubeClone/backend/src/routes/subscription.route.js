import {Router} from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  toggleSubscription,
  getUserChannelSubscribers,
} from "../controllers/subscription.controller.js";
const router = Router();

router.route("/:channelId").patch(verifyJWT, toggleSubscription);
router
  .route("/:channelId/subscribers")
  .get(verifyJWT, getUserChannelSubscribers);

export {router as subscriptionRouter}
