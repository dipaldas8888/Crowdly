import User from "../models/User.js";
import Post from "../models/Post.js";
import Group from "../models/Group.js";
import { ApiError } from "../utils/apiError.js";
import cloudinary from "../config/cloudinary.js";
import bcrypt from "bcryptjs";

const uploadToCloudinary = (fileBuffer, folder = "crowdly/profiles") =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );
    stream.end(fileBuffer);
  });

export const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.params.id === "me" ? req.user : req.params.id;

    const user = await User.findById(userId)
      .select("-password")
      .populate("friends", "username avatar")
      .populate("followers", "username avatar");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const [postsCount, photosCount, videosCount, totalLikesAgg, groupsCount] = await Promise.all([
      Post.countDocuments({ user: userId }),
      Post.countDocuments({ user: userId, image: { $exists: true, $ne: "" } }),
      Post.countDocuments({ user: userId, video: { $exists: true, $ne: "" } }),
      Post.aggregate([
        { $match: { user: user._id } },
        { $project: { likesCount: { $size: "$likes" } } },
        { $group: { _id: null, totalLikes: { $sum: "$likesCount" } } },
      ]),
      Group.countDocuments({ members: userId }),
    ]);

    const likesCount = totalLikesAgg[0]?.totalLikes || 0;
    const likedPostsCount = await Post.countDocuments({ likes: userId });

    res.json({
      user,
      stats: {
        postsCount,
        photosCount,
        videosCount,
        likesCount, // total likes received on user's posts
        likedPostsCount, // total posts liked by user
        followersCount: user.followers?.length || user.friends?.length || 0,
        friendsCount: user.friends?.length || 0,
        groupsCount,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const { username, handle, bio } = req.body;

    if (username) user.username = username;
    if (handle !== undefined) user.handle = handle;
    if (bio !== undefined) user.bio = bio;

    if (req.files?.avatar?.[0]) {
      const uploadedAvatar = await uploadToCloudinary(req.files.avatar[0].buffer, "crowdly/avatars");
      user.avatar = uploadedAvatar.secure_url;
    }

    if (req.files?.coverImage?.[0]) {
      const uploadedCover = await uploadToCloudinary(req.files.coverImage[0].buffer, "crowdly/covers");
      user.coverImage = uploadedCover.secure_url;
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select("-password");

    res.json(updatedUser);
  } catch (err) {
    next(err);
  }
};

export const getUserPosts = async (req, res, next) => {
  try {
    const userId = req.params.id === "me" ? req.user : req.params.id;

    const posts = await Post.find({ user: userId })
      .populate("user", "username avatar")
      .populate("likes", "username avatar")
      .populate("taggedFriends", "username avatar")
      .populate({
        path: "originalPost",
        populate: [
          { path: "user", select: "username avatar" },
          { path: "taggedFriends", select: "username avatar" },
        ],
      })
      .populate("comments.user", "username avatar")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    next(err);
  }
};

export const getUserPhotos = async (req, res, next) => {
  try {
    const userId = req.params.id === "me" ? req.user : req.params.id;

    const posts = await Post.find({
      user: userId,
      image: { $exists: true, $ne: "" },
    })
      .populate("user", "username avatar")
      .populate("likes", "username avatar")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    next(err);
  }
};

export const getUserVideos = async (req, res, next) => {
  try {
    const userId = req.params.id === "me" ? req.user : req.params.id;

    const posts = await Post.find({
      user: userId,
      video: { $exists: true, $ne: "" },
    })
      .populate("user", "username avatar")
      .populate("likes", "username avatar")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    next(err);
  }
};

export const getUserLikes = async (req, res, next) => {
  try {
    const userId = req.params.id === "me" ? req.user : req.params.id;

    const posts = await Post.find({ likes: userId })
      .populate("user", "username avatar")
      .populate("likes", "username avatar")
      .populate("comments.user", "username avatar")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    next(err);
  }
};

// Update Account Settings (username, email, phone, dob, gender, language, country, bio, handle)
export const updateAccountSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user);
    if (!user) throw new ApiError(404, "User not found");

    const {
      username,
      email,
      phone,
      dateOfBirth,
      gender,
      language,
      country,
      handle,
      bio,
    } = req.body;

    if (username && username.trim()) {
      user.username = username.trim();
    }

    if (email && email.trim() && email.toLowerCase() !== user.email) {
      const existing = await User.findOne({ email: email.toLowerCase().trim() });
      if (existing && existing._id.toString() !== user._id.toString()) {
        throw new ApiError(409, "Email is already taken by another account");
      }
      user.email = email.toLowerCase().trim();
    }

    if (phone !== undefined) user.phone = phone;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    if (gender !== undefined) user.gender = gender;
    if (language !== undefined) user.language = language;
    if (country !== undefined) user.country = country;
    if (handle !== undefined) user.handle = handle;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    const updatedUser = await User.findById(user._id).select("-password");
    res.json(updatedUser);
  } catch (err) {
    next(err);
  }
};

// Change Password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new ApiError(400, "Current and new password are required");
    }

    if (newPassword.length < 6) {
      throw new ApiError(400, "New password must be at least 6 characters");
    }

    const user = await User.findById(req.user);
    if (!user) throw new ApiError(404, "User not found");

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new ApiError(401, "Current password is incorrect");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
};

// Update Privacy Settings
export const updatePrivacySettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user);
    if (!user) throw new ApiError(404, "User not found");

    const { isPrivate, privacySettings } = req.body;

    if (typeof isPrivate === "boolean") {
      user.isPrivate = isPrivate;
    }

    if (privacySettings && typeof privacySettings === "object") {
      user.privacySettings = {
        ...user.privacySettings,
        ...privacySettings,
      };
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select("-password");
    res.json(updatedUser);
  } catch (err) {
    next(err);
  }
};

// Deactivate Account
export const deactivateAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user);
    if (!user) throw new ApiError(404, "User not found");

    user.isDeactivated = true;
    await user.save();

    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    res.json({ message: "Account deactivated successfully" });
  } catch (err) {
    next(err);
  }
};

// Delete Account
export const deleteAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user);
    if (!user) throw new ApiError(404, "User not found");

    // Remove user's posts
    await Post.deleteMany({ user: req.user });

    // Remove user
    await User.findByIdAndDelete(req.user);

    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    });

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    next(err);
  }
};
