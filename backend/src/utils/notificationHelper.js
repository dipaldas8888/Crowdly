import Notification from "../models/Notification.js";
import { io, onlineUsers } from "../../server.js";

/**
 * Creates a notification in DB and emits real-time socket event if recipient is online.
 */
export const createAndSendNotification = async ({
  recipient,
  sender,
  type,
  post = null,
}) => {
  try {
    if (!recipient || !sender) return null;

    // Do not notify self
    if (recipient.toString() === sender.toString()) {
      return null;
    }

    // Create notification
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      post,
    });

    // Populate sender and post details for real-time delivery
    const populatedNotification = await Notification.findById(notification._id)
      .populate("sender", "username avatar")
      .populate("post", "text image video");

    // Real-time emit to recipient socket if online
    const recipientSocketId = onlineUsers.get(recipient.toString());
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("newNotification", populatedNotification);
    }

    return populatedNotification;
  } catch (error) {
    console.error("Error creating/sending notification:", error);
    return null;
  }
};
