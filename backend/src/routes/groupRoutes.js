import express from "express";
import {
  createGroup,
  getGroups,
  getMyGroups,
  getGroupById,
  joinGroup,
  leaveGroup,
  getGroupPosts,
  createGroupPost,
} from "../controllers/groupController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/", protect, upload.single("coverImage"), createGroup);
router.get("/", protect, getGroups);
router.get("/my", protect, getMyGroups);
router.get("/user/my-groups", protect, getMyGroups);

router.get("/:id", protect, getGroupById);
router.post("/:id/join", protect, joinGroup);
router.post("/:id/leave", protect, leaveGroup);
router.get("/:id/posts", protect, getGroupPosts);
router.post("/:id/posts", protect, upload.single("image"), createGroupPost);

export default router;
