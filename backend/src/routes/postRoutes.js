import express from "express";
import {
  createPost,
  getFeed,
  likePost,
  commentPost,
  likeComment,
  replyComment,
  updateComment,
  deleteComment,
  updatePost,
  deletePost,
  sharePost,
} from "../controllers/postController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/", protect, upload.single("image"), createPost);
router.get("/", getFeed);
router.put("/:id", protect, upload.single("image"), updatePost);
router.delete("/:id", protect, deletePost);
router.put("/like/:id", protect, likePost);
router.post("/comment/:id", protect, commentPost);
router.put("/:id/comments/:commentId", protect, updateComment);
router.delete("/:id/comments/:commentId", protect, deleteComment);
router.put("/:id/comments/:commentId/like", protect, likeComment);
router.post("/:id/comments/:commentId/reply", protect, replyComment);
router.post("/share/:id", protect, sharePost);

export default router;
