import Post from "../models/Post.js";

export const createPost = async (req, res, next) => {
  try {
    const { text, image } = req.body;

    if (!text && !image) {
      throw new Error("Text or image required");
    }

    const post = await Post.create({
      user: req.user,
      text,
      image,
    });

    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
};

export const getFeed = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate("user", "username")
      .populate("comments.user", "username")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    next(err);
  }
};

export const likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post.likes.includes(req.user)) {
      post.likes.push(req.user);
    }

    await post.save();

    res.json(post);
  } catch (err) {
    next(err);
  }
};

export const commentPost = async (req, res, next) => {
  try {
    const { text } = req.body;

    const post = await Post.findById(req.params.id);

    post.comments.push({
      user: req.user,
      text,
    });

    await post.save();

    res.json(post);
  } catch (err) {
    next(err);
  }
};
