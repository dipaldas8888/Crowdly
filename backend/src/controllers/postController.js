import mongoose from "mongoose";
import Post from "../models/Post.js";
import User from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import cloudinary from "../config/cloudinary.js";
import { createAndSendNotification } from "../utils/notificationHelper.js";

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

    let locationCoords = null;
    if (req.body.locationCoords) {
      try {
        locationCoords = typeof req.body.locationCoords === "string"
          ? JSON.parse(req.body.locationCoords)
          : req.body.locationCoords;
      } catch {
        locationCoords = null;
      }
    }

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
      locationCoords: locationCoords || undefined,
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
      .populate({
        path: "originalPost",
        populate: [
          { path: "user", select: "username avatar" },
          { path: "taggedFriends", select: "username avatar" },
        ],
      })
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

    if (req.body.locationCoords !== undefined) {
      try {
        post.locationCoords = typeof req.body.locationCoords === "string"
          ? JSON.parse(req.body.locationCoords)
          : req.body.locationCoords;
      } catch {
        // keep existing if parse fails
      }
    }

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
    const { text } = req.body;
    const currentUserId = req.user;

    const targetPost = await Post.findById(id);
    if (!targetPost) {
      throw new ApiError(404, "Post not found");
    }

    targetPost.sharesCount = (targetPost.sharesCount || 0) + 1;
    await targetPost.save();

    const rootOriginalPostId = targetPost.originalPost || targetPost._id;

    const sharedPost = await Post.create({
      user: currentUserId,
      text: text?.trim() || "",
      originalPost: rootOriginalPostId,
    });

    // Notify author of original target post
    if (targetPost.user) {
      await createAndSendNotification({
        recipient: targetPost.user,
        sender: currentUserId,
        type: "share",
        post: targetPost._id,
      });
    }

    const populatedPost = await Post.findById(sharedPost._id)
      .populate("user", "username avatar")
      .populate("likes", "username avatar")
      .populate("taggedFriends", "username avatar")
      .populate("group", "name coverImage")
      .populate({
        path: "originalPost",
        populate: [
          { path: "user", select: "username avatar" },
          { path: "taggedFriends", select: "username avatar" },
        ],
      })
      .populate("comments.user", "username avatar")
      .populate("comments.replies.user", "username avatar");

    res.status(201).json(populatedPost);
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
      // Notify post owner
      if (post.user) {
        await createAndSendNotification({
          recipient: post.user,
          sender: req.user,
          type: "like",
          post: post._id,
        });
      }
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
      likes: [],
      replies: [],
      createdAt: new Date(),
    });

    await post.save();

    // Notify post owner
    if (post.user) {
      await createAndSendNotification({
        recipient: post.user,
        sender: req.user,
        type: "comment",
        post: post._id,
      });
    }

    const updatedPost = await Post.findById(post._id)
      .populate("user", "username avatar")
      .populate("likes", "username avatar")
      .populate("taggedFriends", "username avatar")
      .populate("group", "name coverImage")
      .populate("comments.user", "username avatar")
      .populate("comments.replies.user", "username avatar");

    res.json(updatedPost);
  } catch (err) {
    next(err);
  }
};

// Toggle like on a comment
export const likeComment = async (req, res, next) => {
  try {
    const { id: postId, commentId } = req.params;
    const userId = new mongoose.Types.ObjectId(req.user);

    const post = await Post.findById(postId);
    if (!post) throw new ApiError(404, "Post not found");

    const comment = post.comments.id(commentId);
    if (!comment) throw new ApiError(404, "Comment not found");

    const alreadyLiked = comment.likes.some(
      (lid) => lid.toString() === userId.toString()
    );

    if (alreadyLiked) {
      comment.likes = comment.likes.filter(
        (lid) => lid.toString() !== userId.toString()
      );
    } else {
      comment.likes.push(userId);
    }

    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate("user", "username avatar")
      .populate("likes", "username avatar")
      .populate("taggedFriends", "username avatar")
      .populate("group", "name coverImage")
      .populate("comments.user", "username avatar")
      .populate("comments.replies.user", "username avatar");

    res.json(updatedPost);
  } catch (err) {
    next(err);
  }
};

// Add a reply to a comment
export const replyComment = async (req, res, next) => {
  try {
    const { id: postId, commentId } = req.params;
    const { text } = req.body;

    if (!text?.trim()) throw new ApiError(400, "Reply text is required");

    const post = await Post.findById(postId);
    if (!post) throw new ApiError(404, "Post not found");

    const comment = post.comments.id(commentId);
    if (!comment) throw new ApiError(404, "Comment not found");

    comment.replies.push({
      user: req.user,
      text,
      likes: [],
      createdAt: new Date(),
    });

    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate("user", "username avatar")
      .populate("likes", "username avatar")
      .populate("taggedFriends", "username avatar")
      .populate("group", "name coverImage")
      .populate("comments.user", "username avatar")
      .populate("comments.replies.user", "username avatar");

    res.json(updatedPost);
  } catch (err) {
    next(err);
  }
};

// Edit a comment (only comment author)
export const updateComment = async (req, res, next) => {
  try {
    const { id: postId, commentId } = req.params;
    const { text } = req.body;
    const currentUserId = req.user?.toString();

    if (!text?.trim()) throw new ApiError(400, "Comment text is required");

    const post = await Post.findById(postId);
    if (!post) throw new ApiError(404, "Post not found");

    const comment = post.comments.id(commentId);
    if (!comment) throw new ApiError(404, "Comment not found");

    if (comment.user.toString() !== currentUserId) {
      throw new ApiError(403, "Not authorized to edit this comment");
    }

    comment.text = text.trim();
    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate("user", "username avatar")
      .populate("likes", "username avatar")
      .populate("taggedFriends", "username avatar")
      .populate("group", "name coverImage")
      .populate("comments.user", "username avatar")
      .populate("comments.replies.user", "username avatar");

    res.json(updatedPost);
  } catch (err) {
    next(err);
  }
};

// Delete a comment (only post owner OR comment author)
export const deleteComment = async (req, res, next) => {
  try {
    const { id: postId, commentId } = req.params;
    const currentUserId = req.user?.toString();

    const post = await Post.findById(postId);
    if (!post) throw new ApiError(404, "Post not found");

    const comment = post.comments.id(commentId);
    if (!comment) throw new ApiError(404, "Comment not found");

    const isPostOwner = post.user.toString() === currentUserId;
    const isCommentAuthor = comment.user.toString() === currentUserId;

    if (!isPostOwner && !isCommentAuthor) {
      throw new ApiError(403, "Only the post owner or comment author can delete this comment");
    }

    post.comments.pull(commentId);
    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate("user", "username avatar")
      .populate("likes", "username avatar")
      .populate("taggedFriends", "username avatar")
      .populate("group", "name coverImage")
      .populate("comments.user", "username avatar")
      .populate("comments.replies.user", "username avatar");

    res.json(updatedPost);
  } catch (err) {
    next(err);
  }
};

// Toggle Save / Bookmark a post
export const toggleSavePost = async (req, res, next) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user;

    const post = await Post.findById(postId);
    if (!post) {
      throw new ApiError(404, "Post not found");
    }

    const userObj = await User.findById(userId);
    if (!userObj) {
      throw new ApiError(404, "User not found");
    }

    const isSaved = userObj.savedPosts.some(
      (savedId) => savedId.toString() === postId.toString()
    );

    if (isSaved) {
      userObj.savedPosts = userObj.savedPosts.filter(
        (savedId) => savedId.toString() !== postId.toString()
      );
    } else {
      userObj.savedPosts.push(postId);
    }

    await userObj.save();

    res.json({
      saved: !isSaved,
      savedPosts: userObj.savedPosts,
      message: !isSaved ? "Post saved to your bookmarks" : "Post removed from saved",
    });
  } catch (err) {
    next(err);
  }
};

// Get all saved posts for current user
export const getSavedPosts = async (req, res, next) => {
  try {
    const userId = req.user;

    const userObj = await User.findById(userId).populate({
      path: "savedPosts",
      populate: [
        { path: "user", select: "username avatar" },
        { path: "likes", select: "username avatar" },
        { path: "taggedFriends", select: "username avatar" },
        { path: "group", select: "name coverImage" },
        {
          path: "originalPost",
          populate: [
            { path: "user", select: "username avatar" },
            { path: "taggedFriends", select: "username avatar" },
          ],
        },
        { path: "comments.user", select: "username avatar" },
        { path: "comments.replies.user", select: "username avatar" },
      ],
    });

    if (!userObj) {
      throw new ApiError(404, "User not found");
    }

    // Filter out any deleted posts that were nullified
    const validSavedPosts = (userObj.savedPosts || [])
      .filter((p) => p !== null)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ posts: validSavedPosts });
  } catch (err) {
    next(err);
  }
};


