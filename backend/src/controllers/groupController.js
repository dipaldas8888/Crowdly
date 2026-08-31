import Group from "../models/Group.js";
import Post from "../models/Post.js";
import { ApiError } from "../utils/apiError.js";
import cloudinary from "../config/cloudinary.js";

const uploadToCloudinary = (fileBuffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "crowdly/groups",
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

export const createGroup = async (req, res, next) => {
  try {
    const { name, description, privacy } = req.body;

    if (!name || !name.trim()) {
      throw new ApiError(400, "Group name is required");
    }

    let coverImage = "";

    if (req.file) {
      const uploadedImage = await uploadToCloudinary(req.file.buffer);
      coverImage = uploadedImage.secure_url;
    }

    const group = await Group.create({
      name,
      description: description || "",
      privacy: privacy || "public",
      coverImage,
      admin: req.user,
      members: [req.user],
    });

    const populatedGroup = await Group.findById(group._id)
      .populate("admin", "username avatar")
      .populate("members", "username avatar");

    res.status(201).json(populatedGroup);
  } catch (err) {
    next(err);
  }
};

export const getGroups = async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = search
      ? { name: { $regex: search, $options: "i" } }
      : {};

    const groups = await Group.find(query)
      .populate("admin", "username avatar")
      .populate("members", "username avatar")
      .sort({ createdAt: -1 });

    res.json(groups);
  } catch (err) {
    next(err);
  }
};

export const getMyGroups = async (req, res, next) => {
  try {
    const groups = await Group.find({
      members: req.user,
    })
      .populate("admin", "username avatar")
      .populate("members", "username avatar")
      .sort({ createdAt: -1 });

    res.json(groups);
  } catch (err) {
    next(err);
  }
};

export const getGroupById = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("admin", "username avatar email")
      .populate("members", "username avatar email");

    if (!group) {
      throw new ApiError(404, "Group not found");
    }

    res.json(group);
  } catch (err) {
    next(err);
  }
};

export const joinGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      throw new ApiError(404, "Group not found");
    }

    if (!group.members.includes(req.user)) {
      group.members.push(req.user);
      await group.save();
    }

    const updatedGroup = await Group.findById(group._id)
      .populate("admin", "username avatar")
      .populate("members", "username avatar");

    res.json(updatedGroup);
  } catch (err) {
    next(err);
  }
};

export const leaveGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      throw new ApiError(404, "Group not found");
    }

    if (group.admin.toString() === req.user.toString()) {
      throw new ApiError(400, "Group admin cannot leave the group directly");
    }

    group.members = group.members.filter(
      (m) => m.toString() !== req.user.toString(),
    );
    await group.save();

    const updatedGroup = await Group.findById(group._id)
      .populate("admin", "username avatar")
      .populate("members", "username avatar");

    res.json(updatedGroup);
  } catch (err) {
    next(err);
  }
};

export const getGroupPosts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const posts = await Post.find({ group: id })
      .populate("user", "username avatar")
      .populate("likes", "username avatar")
      .populate("taggedFriends", "username avatar")
      .populate("comments.user", "username avatar")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    next(err);
  }
};

export const createGroupPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text, location } = req.body;

    const group = await Group.findById(id);
    if (!group) {
      throw new ApiError(404, "Group not found");
    }

    if (!group.members.includes(req.user)) {
      throw new ApiError(403, "You must be a group member to post");
    }

    let image = "";
    if (req.file) {
      const uploadedImage = await uploadToCloudinary(req.file.buffer);
      image = uploadedImage.secure_url;
    }

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

    const post = await Post.create({
      user: req.user,
      group: id,
      text: text || "",
      image,
      location: location || "",
      taggedFriends,
    });

    const populatedPost = await Post.findById(post._id)
      .populate("user", "username avatar")
      .populate("group", "name coverImage")
      .populate("taggedFriends", "username avatar");

    res.status(201).json(populatedPost);
  } catch (err) {
    next(err);
  }
};
