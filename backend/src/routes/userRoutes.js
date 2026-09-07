import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  getUserPosts,
  getUserPhotos,
  getUserVideos,
  getUserLikes,
  updateAccountSettings,
  changePassword,
  updatePrivacySettings,
  deactivateAccount,
  deleteAccount,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/profile/:id", protect, getUserProfile);
router.put(
  "/profile",
  protect,
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  updateUserProfile,
);

router.get("/profile/:id/posts", protect, getUserPosts);
router.get("/profile/:id/photos", protect, getUserPhotos);
router.get("/profile/:id/videos", protect, getUserVideos);
router.get("/profile/:id/likes", protect, getUserLikes);

// Settings routes
router.put("/settings/account", protect, updateAccountSettings);
router.put("/settings/password", protect, changePassword);
router.put("/settings/privacy", protect, updatePrivacySettings);
router.post("/settings/deactivate", protect, deactivateAccount);
router.delete("/settings/delete", protect, deleteAccount);

export default router;
