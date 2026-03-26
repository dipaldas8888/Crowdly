import Post from "../models/Post.js";
import { ApiError } from "../utils/apiError.js";
import cloudinary from "../config/cloudinary.js";

const uploadToCloudinary = (fileBuffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "crowdly/posts",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      },
    );

    stream.end(fileBuffer);
  });

export const createPost = async (req, res, next) => {
  try {
    const { text } = req.body;
    let image = "";

    if (!text && !req.file) {
      throw new ApiError(400, "Text or image required");
    }

    if (req.file) {
      const uploadedImage = await uploadToCloudinary(req.file.buffer);
      image = uploadedImage.secure_url;
    }

    const post = await Post.create({
      user: req.user,
      text,
      image,
    });

    const populatedPost = await Post.findById(post._id).populate(
      "user",
      "username",
    );

    res.status(201).json(populatedPost);
  } catch (err) {
    next(err);
  }
};

export const getFeed = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate("user", "username")
      .populate("likes", "username")
      .populate("comments.user", "username")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    next(err);
  }
};

import mongoose from "mongoose";

export const likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      throw new ApiError(404, "Post not found");
    }

    const userId = new mongoose.Types.ObjectId(req.user);

    const alreadyLiked = post.likes.some(
      (id) => id.toString() === userId.toString(),
    );

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString(),
      );
    } else {
      // 🔥 LIKE
      post.likes.push(userId);
    }

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate("user", "username")
      .populate("likes", "username")
      .populate("comments.user", "username");

    res.json(updatedPost);
  } catch (err) {
    next(err);
  }
};

export const commentPost = async (req, res, next) => {
  try {
    const { text } = req.body;

    const post = await Post.findById(req.params.id);

    if (!post) {
      throw new ApiError(404, "Post not found");
    }

    if (!text?.trim()) {
      throw new ApiError(400, "Comment text is required");
    }

    post.comments.push({
      user: req.user,
      text,
    });

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate("user", "username")
      .populate("likes", "username")
      .populate("comments.user", "username");

    res.json(updatedPost);
  } catch (err) {
    next(err);
  }
};
