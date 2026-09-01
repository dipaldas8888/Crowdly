import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";
import { ApiError } from "../utils/apiError.js";

export const getConversations = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user;

    // Get current user with friends populated
    const currentUser = await User.findById(userId).populate("friends", "username avatar isOnline lastActive");

    // Find all distinct users current user has exchanged messages with
    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }],
    }).sort({ createdAt: -1 });

    const partnerMap = new Map();

    for (const msg of messages) {
      const partnerId =
        msg.sender.toString() === userId.toString()
          ? msg.recipient.toString()
          : msg.sender.toString();

      if (!partnerMap.has(partnerId)) {
        const partnerUser = await User.findById(partnerId).select("username avatar isOnline lastActive");
        if (partnerUser) {
          // Count unread messages sent by this partner to current user
          const unreadCount = await Message.countDocuments({
            sender: partnerId,
            recipient: userId,
            read: false,
          });

          partnerMap.set(partnerId, {
            user: partnerUser,
            lastMessage: msg,
            unreadCount,
          });
        }
      }
    }

    // Also include friends who haven't messaged yet
    if (currentUser && currentUser.friends) {
      for (const friend of currentUser.friends) {
        const friendId = friend._id.toString();
        if (!partnerMap.has(friendId)) {
          partnerMap.set(friendId, {
            user: friend,
            lastMessage: null,
            unreadCount: 0,
          });
        }
      }
    }

    const conversations = Array.from(partnerMap.values());

    res.json(conversations);
  } catch (err) {
    next(err);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const currentUserId = req.user?._id || req.user;
    const { userId: partnerId } = req.params;

    // Mark messages sent by partner to current user as read
    await Message.updateMany(
      { sender: partnerId, recipient: currentUserId, read: false },
      { $set: { read: true } },
    );

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: partnerId },
        { sender: partnerId, recipient: currentUserId },
      ],
    })
      .populate("sender", "username avatar")
      .populate("recipient", "username avatar")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    next(err);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const currentUserId = req.user?._id || req.user;
    const { userId: partnerId } = req.params;
    const { text } = req.body;

    let imageUrl = "";

    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "crowdly/messages" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );
        uploadStream.end(req.file.buffer);
      });
      imageUrl = uploadResult.secure_url;
    }

    if (!text && !imageUrl) {
      throw new ApiError(400, "Message must contain text or an image");
    }

    const newMessage = await Message.create({
      sender: currentUserId,
      recipient: partnerId,
      text: text || "",
      image: imageUrl,
      read: false,
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "username avatar")
      .populate("recipient", "username avatar");

    res.status(201).json(populatedMessage);
  } catch (err) {
    next(err);
  }
};
