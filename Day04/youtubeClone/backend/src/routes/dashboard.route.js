import { Router } from "express";
import {
  getChannelStats,
  getChannelVideos,
  getChannelViewEngagement,
} from "../controllers/dashboard.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/stats").get(verifyJWT, getChannelStats);
router.route("/videos").get(verifyJWT, getChannelVideos);
router.route("/engagement").get(verifyJWT, getChannelViewEngagement);

export { router as dashboardRouter };
