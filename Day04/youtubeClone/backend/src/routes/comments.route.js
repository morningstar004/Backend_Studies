import { Router } from "express";
import {
  editComment,
  getVideoComments,
  addComment,
  deleteComment,
} from "../controllers/comments.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/getComments").get(getVideoComments);
router.route("/addComment").post(verifyJWT, addComment);
router.route("/editComment").patch(verifyJWT, editComment);
router.route("/deleteComment").delete(verifyJWT, deleteComment);

export { router as commentsRouter };
