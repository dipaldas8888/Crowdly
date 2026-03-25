import express from "express";
import {
  createPost,
  getFeed,
  likePost,
  commentPost,
} from "../controllers/postController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createPost);
router.get("/", getFeed);
router.put("/like/:id", protect, likePost);
router.post("/comment/:id", protect, commentPost);

export default router;
