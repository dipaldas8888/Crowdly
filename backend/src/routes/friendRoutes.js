import express from "express";
import {
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getFriends,
  getFriendRequests,
  getSuggestedFriends,
} from "../controllers/friendController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/search", protect, searchUsers);
router.get("/", protect, getFriends);
router.get("/requests", protect, getFriendRequests);
router.get("/suggested", protect, getSuggestedFriends);
router.post("/request/:id", protect, sendFriendRequest);
router.put("/accept/:id", protect, acceptFriendRequest);
router.put("/reject/:id", protect, rejectFriendRequest);
router.delete("/remove/:id", protect, removeFriend);

export default router;
