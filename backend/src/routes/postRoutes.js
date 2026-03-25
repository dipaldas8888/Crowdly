import express from "express";
import {
  createPost,
  getFeed,
  likePost,
  commentPost,
} from "../controllers/postController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/", protect, upload.single("image"), createPost);
router.get("/", getFeed);
router.put("/like/:id", protect, likePost);
router.post("/comment/:id", protect, commentPost);

export default router;
