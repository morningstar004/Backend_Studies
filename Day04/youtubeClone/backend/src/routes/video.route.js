import { Router } from "express";
import { deleteVideo, getAllVideos, getVideoById, publishAVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/getAllVideos").get(getAllVideos);
router.route("/publishAVideo").post(verifyJWT, publishAVideo);
router.route("/getVideoById").get(verifyJWT, getVideoById);
router.route("/updateVideo").patch(verifyJWT, updateVideo);
router.route("/deleteVideo").delete(verifyJWT, deleteVideo);
router.route("/togglePublishStatus").patch(verifyJWT, togglePublishStatus);

export { router as videoRouter };
