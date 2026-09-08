import Story from "../models/Story.js";
import { ApiError } from "../utils/apiError.js";
import cloudinary from "../config/cloudinary.js";

const uploadToCloudinary = (fileBuffer, isVideo = false) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "crowdly/stories",
        resource_type: isVideo ? "video" : "auto",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    stream.end(fileBuffer);
  });

// @desc    Create a new story
// @route   POST /api/stories
// @access  Private
export const createStory = async (req, res, next) => {
  try {
    const { caption } = req.body;
    const userId = req.user?._id || req.user;

    if (!userId) {
      throw new ApiError(401, "User authorization missing");
    }

    if (!req.file) {
      throw new ApiError(400, "Please upload an image or video for your story");
    }

    const isVideo = req.file.mimetype.startsWith("video/");
    const uploadResult = await uploadToCloudinary(req.file.buffer, isVideo);

    const story = await Story.create({
      user: userId,
      mediaUrl: uploadResult.secure_url,
      mediaType: isVideo ? "video" : "image",
      caption: caption || "",
      views: [userId], // Creator automatically views their own story
    });

    await story.populate("user", "username avatar name");

    res.status(201).json({
      success: true,
      data: story,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active stories (from all users within last 24h)
// @route   GET /api/stories
// @access  Private
export const getStories = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user;
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const stories = await Story.find({
      createdAt: { $gte: twentyFourHoursAgo },
    })
      .populate("user", "username avatar name")
      .sort({ createdAt: -1 });

    // Group stories by user for UI display
    const groupedStoriesMap = new Map();

    stories.forEach((story) => {
      if (!story.user) return;
      const uIdStr = story.user._id.toString();
      if (!groupedStoriesMap.has(uIdStr)) {
        groupedStoriesMap.set(uIdStr, {
          user: story.user,
          stories: [],
          hasUnseen: false,
        });
      }
      const group = groupedStoriesMap.get(uIdStr);
      const isViewed = story.views.some(
        (vId) => vId.toString() === userId.toString()
      );
      if (!isViewed) {
        group.hasUnseen = true;
      }
      group.stories.push(story);
    });

    const groupedStories = Array.from(groupedStoriesMap.values());

    res.status(200).json({
      success: true,
      count: stories.length,
      data: stories,
      grouped: groupedStories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark a story as viewed
// @route   POST /api/stories/:id/view
// @access  Private
export const markStoryAsViewed = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.user;
    const story = await Story.findById(id);

    if (!story) {
      throw new ApiError(404, "Story not found or expired");
    }

    if (!story.views.some((vId) => vId.toString() === userId.toString())) {
      story.views.push(userId);
      await story.save();
    }

    res.status(200).json({
      success: true,
      data: story,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete owned story
// @route   DELETE /api/stories/:id
// @access  Private
export const deleteStory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id || req.user;
    const story = await Story.findById(id);

    if (!story) {
      throw new ApiError(404, "Story not found");
    }

    if (story.user.toString() !== userId.toString()) {
      throw new ApiError(403, "Not authorized to delete this story");
    }

    await story.deleteOne();

    res.status(200).json({
      success: true,
      message: "Story deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
