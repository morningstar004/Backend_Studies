import { Router } from "express";
import { deleteVideo, getAllVideos, getVideoById, publishAVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { uploadVideo } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/getAllVideos").get(getAllVideos);
router.route("/publishAVideo").post(
  verifyJWT,
  uploadVideo.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  publishAVideo,
);
router.route("/getVideoById").get(verifyJWT, getVideoById);
router.route("/updateVideo").patch(verifyJWT, updateVideo);
router.route("/deleteVideo").delete(verifyJWT, deleteVideo);
router.route("/togglePublishStatus").patch(verifyJWT, togglePublishStatus);

export { router as videoRouter };
