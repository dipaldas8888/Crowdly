import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";

export const connectDB = async () => {
  if (!process.env.MONGO_URL) {
    throw new ApiError(500, "MONGO_URL is not configured");
  }

  await mongoose.connect(process.env.MONGO_URL);
  console.log("MongoDB connected");
};
