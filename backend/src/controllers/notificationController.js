import Notification from "../models/Notification.js";
import { ApiError } from "../utils/apiError.js";

// Get user notifications
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user })
      .populate("sender", "username avatar")
      .populate("post", "text image video")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (err) {
    next(err);
  }
};

// Get unread notification count
export const getUnreadCount = async (req, res, next) => {
  try {
    const unreadCount = await Notification.countDocuments({
      recipient: req.user,
      read: false,
    });

    res.json({ unreadCount });
  } catch (err) {
    next(err);
  }
};

// Mark single notification as read
export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: req.user },
      { read: true },
      { new: true }
    )
      .populate("sender", "username avatar")
      .populate("post", "text image video");

    if (!notification) {
      throw new ApiError(404, "Notification not found");
    }

    res.json(notification);
  } catch (err) {
    next(err);
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user, read: false },
      { read: true }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    next(err);
  }
};

// Delete a notification
export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipient: req.user,
    });

    if (!notification) {
      throw new ApiError(404, "Notification not found");
    }

    res.json({ message: "Notification deleted successfully", id });
  } catch (err) {
    next(err);
  }
};

// Clear all notifications for logged in user
export const clearAllNotifications = async (req, res, next) => {
  try {
    await Notification.deleteMany({ recipient: req.user });

    res.json({ message: "All notifications cleared" });
  } catch (err) {
    next(err);
  }
};
