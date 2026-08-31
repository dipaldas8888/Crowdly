import express from "express";
import {
  register,
  login,
  logout,
  getMe,
  sendRegisterOTP,
  verifyOTPRegister,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/send-otp", sendRegisterOTP);
router.post("/verify-otp-register", verifyOTPRegister);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, getMe);

export default router;
