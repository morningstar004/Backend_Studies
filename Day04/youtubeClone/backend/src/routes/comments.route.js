import { Router } from "express";
import {
  editComment,
  getVideoComments,
  addComment,
  deleteComment,
} from "../controllers/comments.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/:videoId/getComments").get(verifyJWT, getVideoComments);
router.route("/:videoId/addComment").post(verifyJWT, addComment);
router.route("/:commentId/editComment").patch(verifyJWT, editComment);
router.route("/:commentId/deleteComment").delete(verifyJWT, deleteComment);

export { router as commentsRouter };
