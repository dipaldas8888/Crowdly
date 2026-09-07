import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    handle: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    coverImage: {
      type: String,
      default: "",
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    friendRequestsSent: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    friendRequestsReceived: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isOnline: {
      type: Boolean,
      default: true,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    phone: {
      type: String,
      default: "",
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      default: "",
    },
    language: {
      type: String,
      default: "English",
    },
    country: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isDeactivated: {
      type: Boolean,
      default: false,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    privacySettings: {
      whoCanFollow: {
        type: String,
        enum: ["Everyone", "People you approve"],
        default: "Everyone",
      },
      whoCanMessage: {
        type: String,
        enum: ["Everyone", "Followers", "Nobody"],
        default: "Everyone",
      },
      whoCanComment: {
        type: String,
        enum: ["Everyone", "Followers", "Nobody"],
        default: "Everyone",
      },
      whoCanMention: {
        type: String,
        enum: ["Everyone", "Followers", "Nobody"],
        default: "Everyone",
      },
      whoCanTag: {
        type: String,
        enum: ["Everyone", "Followers", "Nobody"],
        default: "Everyone",
      },
    },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
