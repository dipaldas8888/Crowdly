import express from "express";
import {
  createStory,
  getStories,
  markStoryAsViewed,
  deleteStory,
} from "../controllers/storyController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/").get(getStories).post(upload.single("media"), createStory);

router.post("/:id/view", markStoryAsViewed);
router.delete("/:id", deleteStory);

export default router;
