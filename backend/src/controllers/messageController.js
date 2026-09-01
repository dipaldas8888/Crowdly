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
    let fileUrl = "";
    let fileName = "";

    if (req.file) {
      const isImage = req.file.mimetype?.startsWith("image/");
      const isPdf = req.file.mimetype === "application/pdf" || req.file.originalname?.endsWith(".pdf");

      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "crowdly/messages",
            resource_type: isImage ? "image" : "auto",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );
        uploadStream.end(req.file.buffer);
      });

      if (isImage) {
        imageUrl = uploadResult.secure_url;
      } else {
        fileUrl = uploadResult.secure_url;
        fileName = req.file.originalname || "document.pdf";
      }
    }

    if (!text && !imageUrl && !fileUrl) {
      throw new ApiError(400, "Message must contain text, an image, or a file");
    }

    const newMessage = await Message.create({
      sender: currentUserId,
      recipient: partnerId,
      text: text || "",
      image: imageUrl,
      fileUrl,
      fileName,
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

// Delete a single message
export const deleteMessage = async (req, res, next) => {
  try {
    const currentUserId = req.user?._id || req.user;
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      throw new ApiError(404, "Message not found");
    }

    if (
      message.sender.toString() !== currentUserId.toString() &&
      message.recipient.toString() !== currentUserId.toString()
    ) {
      throw new ApiError(403, "Not authorized to delete this message");
    }

    await Message.findByIdAndDelete(messageId);

    res.json({ message: "Message deleted successfully", messageId });
  } catch (err) {
    next(err);
  }
};

// Edit a single message
export const editMessage = async (req, res, next) => {
  try {
    const currentUserId = req.user?._id || req.user;
    const { messageId } = req.params;
    const { text } = req.body;

    if (!text?.trim()) {
      throw new ApiError(400, "Message text is required");
    }

    const message = await Message.findById(messageId);
    if (!message) {
      throw new ApiError(404, "Message not found");
    }

    if (message.sender.toString() !== currentUserId.toString()) {
      throw new ApiError(403, "Not authorized to edit this message");
    }

    message.text = text.trim();
    message.isEdited = true;
    await message.save();

    const updatedMessage = await Message.findById(messageId)
      .populate("sender", "username avatar")
      .populate("recipient", "username avatar");

    res.json(updatedMessage);
  } catch (err) {
    next(err);
  }
};

// Delete an entire conversation with a user
export const deleteConversation = async (req, res, next) => {
  try {
    const currentUserId = req.user?._id || req.user;
    const { userId: partnerId } = req.params;

    await Message.deleteMany({
      $or: [
        { sender: currentUserId, recipient: partnerId },
        { sender: partnerId, recipient: currentUserId },
      ],
    });

    res.json({ message: "Conversation deleted successfully", partnerId });
  } catch (err) {
    next(err);
  }
};
