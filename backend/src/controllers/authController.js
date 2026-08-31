import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import OTP from "../models/OTP.js";
import { generateToken } from "../utils/generateToken.js";
import { ApiError } from "../utils/apiError.js";
import { sendEmail } from "../utils/sendEmail.js";

const sanitizeUser = (user) => ({
  id: user._id,
  _id: user._id,
  username: user.username,
  email: user.email,
  handle: user.handle,
  avatar: user.avatar,
  coverImage: user.coverImage,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const generate6DigitOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      throw new ApiError(409, "User with this email already exists");
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password: hashed,
    });

    generateToken(user._id, res);

    res.status(201).json(sanitizeUser(user));
  } catch (err) {
    next(err);
  }
};

export const sendRegisterOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      throw new ApiError(400, "Email address is required");
    }

    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      throw new ApiError(409, "User with this email is already registered");
    }

    const otpCode = generate6DigitOTP();

    // Clear any previous registration OTP for this email
    await OTP.deleteMany({ email: cleanEmail, type: "register" });

    await OTP.create({
      email: cleanEmail,
      otp: otpCode,
      type: "register",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
        <h2 style="color: #047857; text-align: center;">Welcome to Crowdly</h2>
        <p>Your 6-digit Verification Code for registration is:</p>
        <div style="background-color: #f0fdf4; border: 1px dashed #10b981; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #065f46; margin: 20px 0;">
          ${otpCode}
        </div>
        <p style="font-size: 12px; color: #64748b;">This OTP code will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
      </div>
    `;

    await sendEmail({
      to: cleanEmail,
      subject: "Crowdly Registration OTP Verification Code",
      text: `Your Crowdly registration OTP code is ${otpCode}`,
      html: htmlContent,
    });

    res.json({
      message: `Verification OTP sent to ${cleanEmail}`,
      email: cleanEmail,
      devOtp: process.env.NODE_ENV !== "production" ? otpCode : undefined,
    });
  } catch (err) {
    next(err);
  }
};

export const verifyOTPRegister = async (req, res, next) => {
  try {
    const { username, email, password, otp } = req.body;

    if (!username || !email || !password || !otp) {
      throw new ApiError(400, "Username, email, password, and OTP are required");
    }

    const cleanEmail = email.toLowerCase().trim();

    const otpRecord = await OTP.findOne({
      email: cleanEmail,
      type: "register",
    });

    if (!otpRecord) {
      throw new ApiError(400, "OTP expired or not found. Please request a new OTP code.");
    }

    if (otpRecord.attempts >= 5) {
      await OTP.deleteOne({ _id: otpRecord._id });
      throw new ApiError(400, "Too many failed attempts. Please request a new OTP.");
    }

    if (otpRecord.otp !== otp.toString().trim()) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      throw new ApiError(400, "Invalid OTP verification code");
    }

    // OTP matches! Delete OTP document
    await OTP.deleteOne({ _id: otpRecord._id });

    // Check if user exists
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      throw new ApiError(409, "User with this email already exists");
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: username.trim(),
      email: cleanEmail,
      password: hashed,
    });

    generateToken(user._id, res);

    res.status(201).json(sanitizeUser(user));
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      throw new ApiError(400, "Email address is required");
    }

    const cleanEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      throw new ApiError(404, "No account registered with this email address");
    }

    const otpCode = generate6DigitOTP();

    // Clear previous reset OTP for this email
    await OTP.deleteMany({ email: cleanEmail, type: "forgot_password" });

    await OTP.create({
      email: cleanEmail,
      otp: otpCode,
      type: "forgot_password",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
        <h2 style="color: #047857; text-align: center;">Reset Your Crowdly Password</h2>
        <p>Your Password Reset Verification Code is:</p>
        <div style="background-color: #fff1f2; border: 1px dashed #f43f5e; padding: 15px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #be123c; margin: 20px 0;">
          ${otpCode}
        </div>
        <p style="font-size: 12px; color: #64748b;">This OTP code will expire in 10 minutes. If you did not request a password reset, please ignore this message.</p>
      </div>
    `;

    await sendEmail({
      to: cleanEmail,
      subject: "Crowdly Password Reset OTP Code",
      text: `Your Crowdly password reset OTP code is ${otpCode}`,
      html: htmlContent,
    });

    res.json({
      message: `Password reset code sent to ${cleanEmail}`,
      email: cleanEmail,
      devOtp: process.env.NODE_ENV !== "production" ? otpCode : undefined,
    });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      throw new ApiError(400, "Email, OTP code, and new password are required");
    }

    if (newPassword.length < 6) {
      throw new ApiError(400, "New password must be at least 6 characters long");
    }

    const cleanEmail = email.toLowerCase().trim();

    const otpRecord = await OTP.findOne({
      email: cleanEmail,
      type: "forgot_password",
    });

    if (!otpRecord) {
      throw new ApiError(400, "Password reset code expired or invalid. Please request a new code.");
    }

    if (otpRecord.otp !== otp.toString().trim()) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      throw new ApiError(400, "Invalid verification OTP code");
    }

    // OTP verified! Find user and update password
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      throw new ApiError(404, "User account not found");
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    // Delete used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    res.json({
      message: "Password reset successfully! You can now log in with your new password.",
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new ApiError(401, "Invalid email or password");
    }

    generateToken(user._id, res);

    res.json(sanitizeUser(user));
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user).select("-password");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    res.json(sanitizeUser(user));
  } catch (err) {
    next(err);
  }
};

export const logout = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    secure: process.env.NODE_ENV === "production",
  });

  res.status(200).json({ message: "Logged out successfully" });
};
