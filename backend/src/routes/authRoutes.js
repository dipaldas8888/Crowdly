import express from "express";
import {
  register,
  login,
  getMe,
  logout,
} from "../controllers/authController.js";
import { validate } from "../middleware/validateMiddleware.js";
import { loginSchema, registerSchema } from "../validators/AuthValidators.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/me", protect, getMe);
router.post("/logout", logout);

export default router;
