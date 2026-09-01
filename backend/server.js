import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
import { connectDB } from "./src/config/db.js";

import authRoutes from "./src/routes/authRoutes.js";
import postRoutes from "./src/routes/postRoutes.js";
import friendRoutes from "./src/routes/friendRoutes.js";
import groupRoutes from "./src/routes/groupRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import messageRoutes from "./src/routes/messageRoutes.js";
import watchRoutes from "./src/routes/watchRoutes.js";
import { errorHandler } from "./src/middleware/errorMiddleware.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Socket.io setup
export const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    credentials: true,
  },
});

// Map userId -> socketId for online tracking
export const onlineUsers = new Map();

io.on("connection", (socket) => {
  const userId = socket.handshake.auth.userId;

  if (userId) {
    onlineUsers.set(userId, socket.id);
    // Broadcast online users list to all clients
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    console.log(`User connected: ${userId}`);
  }

  // Handle private message via socket (for real-time delivery)
  socket.on("sendMessage", (message) => {
    const recipientId = message.recipient?._id || message.recipient;
    const recipientSocketId = onlineUsers.get(recipientId?.toString());
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("newMessage", message);
    }
  });

  // Typing indicator
  socket.on("typing", ({ to }) => {
    const recipientSocketId = onlineUsers.get(to?.toString());
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("typing", { from: userId });
    }
  });

  socket.on("stopTyping", ({ to }) => {
    const recipientSocketId = onlineUsers.get(to?.toString());
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("stopTyping", { from: userId });
    }
  });

  socket.on("disconnect", () => {
    if (userId) {
      onlineUsers.delete(userId);
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
      console.log(`User disconnected: ${userId}`);
    }
  });
});

// Express middleware
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  }),
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/watch", watchRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
