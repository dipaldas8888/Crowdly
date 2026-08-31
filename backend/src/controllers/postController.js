import mongoose from "mongoose";
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
    const { text, location, group } = req.body;
    let taggedFriends = [];

    if (req.body.taggedFriends) {
      try {
        taggedFriends = typeof req.body.taggedFriends === "string"
          ? JSON.parse(req.body.taggedFriends)
          : req.body.taggedFriends;
      } catch {
        taggedFriends = [];
      }
    }

    let image = "";

    if (!text && !req.file && !location) {
      throw new ApiError(400, "Text, location or image required");
    }

    if (req.file) {
      const uploadedImage = await uploadToCloudinary(req.file.buffer);
      image = uploadedImage.secure_url;
    }

    const post = await Post.create({
      user: req.user,
      text: text || "",
      image,
      location: location || "",
      taggedFriends,
      group: group || null,
    });

    const populatedPost = await Post.findById(post._id)
      .populate("user", "username avatar")
      .populate("taggedFriends", "username avatar")
      .populate("group", "name coverImage");

    res.status(201).json(populatedPost);
  } catch (err) {
    next(err);
  }
};

export const getFeed = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const groupId = req.query.group || null;

    const query = groupId ? { group: groupId } : { group: null };

    const skip = (page - 1) * limit;

    const totalPosts = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate("user", "username avatar")
      .populate("likes", "username avatar")
      .populate("taggedFriends", "username avatar")
      .populate("group", "name coverImage")
      .populate("comments.user", "username avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalPosts / limit);

    res.json({
      posts,
      currentPage: page,
      totalPages,
      hasMore: page < totalPages,
      totalPosts,
    });
  } catch (err) {
    next(err);
  }
};

export const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text, location } = req.body;

    const post = await Post.findById(id);

    if (!post) {
      throw new ApiError(404, "Post not found");
    }

    if (post.user.toString() !== req.user.toString()) {
      throw new ApiError(403, "Not authorized to update this post");
    }

    if (text !== undefined) post.text = text;
    if (location !== undefined) post.location = location;

    if (req.body.taggedFriends) {
      try {
        post.taggedFriends = typeof req.body.taggedFriends === "string"
          ? JSON.parse(req.body.taggedFriends)
          : req.body.taggedFriends;
      } catch {
        // keep existing if parse fails
      }
    }

    if (req.file) {
      const uploadedImage = await uploadToCloudinary(req.file.buffer);
      post.image = uploadedImage.secure_url;
    }

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate("user", "username avatar")
      .populate("likes", "username avatar")
      .populate("taggedFriends", "username avatar")
      .populate("group", "name coverImage")
      .populate("comments.user", "username avatar");

    res.json(updatedPost);
  } catch (err) {
    next(err);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      throw new ApiError(404, "Post not found");
    }

    if (post.user.toString() !== req.user.toString()) {
      throw new ApiError(403, "Not authorized to delete this post");
    }

    await Post.findByIdAndDelete(id);

    res.json({ message: "Post deleted successfully", postId: id });
  } catch (err) {
    next(err);
  }
};

export const sharePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      throw new ApiError(404, "Post not found");
    }

    post.sharesCount = (post.sharesCount || 0) + 1;
    await post.save();

    res.json({ message: "Post shared", sharesCount: post.sharesCount });
  } catch (err) {
    next(err);
  }
};

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
      post.likes.push(userId);
    }

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate("user", "username avatar")
      .populate("likes", "username avatar")
      .populate("taggedFriends", "username avatar")
      .populate("group", "name coverImage")
      .populate("comments.user", "username avatar");

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
      createdAt: new Date(),
    });

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate("user", "username avatar")
      .populate("likes", "username avatar")
      .populate("taggedFriends", "username avatar")
      .populate("group", "name coverImage")
      .populate("comments.user", "username avatar");

    res.json(updatedPost);
  } catch (err) {
    next(err);
  }
};
