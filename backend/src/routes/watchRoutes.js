import express from "express";
import {
  uploadVideo,
  getVideos,
  getVideoById,
  likeVideo,
  commentVideo,
  shareVideo,
} from "../controllers/watchController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", upload.single("video"), uploadVideo);
router.get("/", getVideos);
router.get("/:id", getVideoById);
router.put("/like/:id", likeVideo);
router.post("/comment/:id", commentVideo);
router.post("/share/:id", shareVideo);

export default router;
