import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { encryptData } from "../utils/encrypt.js";

export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const encrypted = encryptData(email);

    const user = await User.create({
      username,
      email,
      password: hashed,
      encryptedData: encrypted,
    });

    generateToken(user._id, res);

    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) throw new Error("User not found");

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) throw new Error("Invalid credentials");

    generateToken(user._id, res);

    res.json(user);
  } catch (err) {
    next(err);
  }
};
