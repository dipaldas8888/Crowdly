import express from "express";
import {
  getConversations,
  getMessages,
  sendMessage,
  deleteMessage,
  editMessage,
  deleteConversation,
} from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/conversations", getConversations);
router.get("/:userId", getMessages);
router.post("/:userId", upload.single("image"), sendMessage);
router.put("/message/:messageId", editMessage);
router.delete("/message/:messageId", deleteMessage);
router.delete("/conversation/:userId", deleteConversation);

export default router;
