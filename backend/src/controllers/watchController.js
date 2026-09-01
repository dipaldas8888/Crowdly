import WatchVideo from "../models/WatchVideo.js";
import cloudinary from "../config/cloudinary.js";
import { ApiError } from "../utils/apiError.js";

export const uploadVideo = async (req, res, next) => {
  try {
    const { title, description, category } = req.body;
    const userId = req.user?._id || req.user;

    if (!userId) {
      throw new ApiError(401, "User authorization required");
    }

    if (!title || !title.trim()) {
      throw new ApiError(400, "Video title is required");
    }

    if (!req.file) {
      throw new ApiError(400, "Please upload a video file");
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "video",
          folder: "crowdly/watch",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );
      uploadStream.end(req.file.buffer);
    });

    const video = await WatchVideo.create({
      user: userId,
      title: title.trim(),
      description: description || "",
      videoUrl: uploadResult.secure_url,
      thumbnailUrl: uploadResult.secure_url.replace(/\.[^/.]+$/, ".jpg"), // auto jpg thumbnail
      category: category || "Entertainment",
    });

    const populatedVideo = await WatchVideo.findById(video._id)
      .populate("user", "username avatar")
      .populate("comments.user", "username avatar");

    res.status(201).json(populatedVideo);
  } catch (err) {
    next(err);
  }
};

export const getVideos = async (req, res, next) => {
  try {
    const { category, search } = req.query;

    const filter = {};

    if (category && category !== "All") {
      filter.category = category;
    }

    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const videos = await WatchVideo.find(filter)
      .populate("user", "username avatar")
      .populate("comments.user", "username avatar")
      .sort({ createdAt: -1 });

    res.json(videos);
  } catch (err) {
    next(err);
  }
};

export const getVideoById = async (req, res, next) => {
  try {
    const video = await WatchVideo.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewsCount: 1 } },
      { new: true },
    )
      .populate("user", "username avatar")
      .populate("comments.user", "username avatar");

    if (!video) {
      throw new ApiError(404, "Video not found");
    }

    res.json(video);
  } catch (err) {
    next(err);
  }
};

export const likeVideo = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user;
    const video = await WatchVideo.findById(req.params.id);

    if (!video) {
      throw new ApiError(404, "Video not found");
    }

    const isLiked = video.likes.some(
      (uId) => uId.toString() === userId.toString(),
    );

    if (isLiked) {
      video.likes = video.likes.filter(
        (uId) => uId.toString() !== userId.toString(),
      );
    } else {
      video.likes.push(userId);
    }

    await video.save();

    const updatedVideo = await WatchVideo.findById(video._id)
      .populate("user", "username avatar")
      .populate("comments.user", "username avatar");

    res.json(updatedVideo);
  } catch (err) {
    next(err);
  }
};

export const commentVideo = async (req, res, next) => {
  try {
    const { text } = req.body;
    const userId = req.user?._id || req.user;

    if (!text || !text.trim()) {
      throw new ApiError(400, "Comment text is required");
    }

    const video = await WatchVideo.findById(req.params.id);

    if (!video) {
      throw new ApiError(404, "Video not found");
    }

    video.comments.push({
      user: userId,
      text: text.trim(),
    });

    await video.save();

    const updatedVideo = await WatchVideo.findById(video._id)
      .populate("user", "username avatar")
      .populate("comments.user", "username avatar");

    res.json(updatedVideo);
  } catch (err) {
    next(err);
  }
};

export const shareVideo = async (req, res, next) => {
  try {
    const video = await WatchVideo.findByIdAndUpdate(
      req.params.id,
      { $inc: { sharesCount: 1 } },
      { new: true },
    )
      .populate("user", "username avatar")
      .populate("comments.user", "username avatar");

    if (!video) {
      throw new ApiError(404, "Video not found");
    }

    res.json(video);
  } catch (err) {
    next(err);
  }
};
