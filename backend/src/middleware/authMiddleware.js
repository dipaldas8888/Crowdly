import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError.js";

export const protect = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) throw new ApiError(401, "Not authorized");

    if (!process.env.JWT_SECRET) {
      throw new ApiError(500, "JWT_SECRET is not configured");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded.userId;

    next();
  } catch (err) {
    next(err);
  }
};
