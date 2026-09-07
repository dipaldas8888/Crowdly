import User from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import { createAndSendNotification } from "../utils/notificationHelper.js";

export const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.json([]);
    }

    const currentUserId = req.user;
    const users = await User.find({
      _id: { $ne: currentUserId },
      $or: [
        { username: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ],
    }).select("username email avatar isOnline lastActive friends friendRequestsReceived friendRequestsSent");

    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const sendFriendRequest = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user;

    if (targetUserId === currentUserId.toString()) {
      throw new ApiError(400, "Cannot send friend request to yourself");
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser) {
      throw new ApiError(404, "User not found");
    }

    if (currentUser.friends.includes(targetUserId)) {
      throw new ApiError(400, "Already friends with this user");
    }

    if (currentUser.friendRequestsSent.includes(targetUserId)) {
      throw new ApiError(400, "Friend request already sent");
    }

    currentUser.friendRequestsSent.push(targetUserId);
    targetUser.friendRequestsReceived.push(currentUserId);

    await currentUser.save();
    await targetUser.save();

    await createAndSendNotification({
      recipient: targetUserId,
      sender: currentUserId,
      type: "friend_request",
    });

    res.json({ message: "Friend request sent successfully" });
  } catch (err) {
    next(err);
  }
};

export const acceptFriendRequest = async (req, res, next) => {
  try {
    const requesterId = req.params.id;
    const currentUserId = req.user;

    const currentUser = await User.findById(currentUserId);
    const requesterUser = await User.findById(requesterId);

    if (!requesterUser) {
      throw new ApiError(404, "Requester user not found");
    }

    if (!currentUser.friendRequestsReceived.includes(requesterId)) {
      throw new ApiError(400, "No pending friend request from this user");
    }

    // Remove request references
    currentUser.friendRequestsReceived = currentUser.friendRequestsReceived.filter(
      (id) => id.toString() !== requesterId.toString(),
    );
    requesterUser.friendRequestsSent = requesterUser.friendRequestsSent.filter(
      (id) => id.toString() !== currentUserId.toString(),
    );

    // Add to friends lists
    if (!currentUser.friends.includes(requesterId)) {
      currentUser.friends.push(requesterId);
    }
    if (!requesterUser.friends.includes(currentUserId)) {
      requesterUser.friends.push(currentUserId);
    }

    await currentUser.save();
    await requesterUser.save();

    await createAndSendNotification({
      recipient: requesterId,
      sender: currentUserId,
      type: "friend_accept",
    });

    res.json({ message: "Friend request accepted" });
  } catch (err) {
    next(err);
  }
};

export const rejectFriendRequest = async (req, res, next) => {
  try {
    const requesterId = req.params.id;
    const currentUserId = req.user;

    const currentUser = await User.findById(currentUserId);
    const requesterUser = await User.findById(requesterId);

    if (currentUser) {
      currentUser.friendRequestsReceived = currentUser.friendRequestsReceived.filter(
        (id) => id.toString() !== requesterId.toString(),
      );
      await currentUser.save();
    }

    if (requesterUser) {
      requesterUser.friendRequestsSent = requesterUser.friendRequestsSent.filter(
        (id) => id.toString() !== currentUserId.toString(),
      );
      await requesterUser.save();
    }

    res.json({ message: "Friend request rejected" });
  } catch (err) {
    next(err);
  }
};

export const removeFriend = async (req, res, next) => {
  try {
    const friendId = req.params.id;
    const currentUserId = req.user;

    const currentUser = await User.findById(currentUserId);
    const friendUser = await User.findById(friendId);

    if (currentUser) {
      currentUser.friends = currentUser.friends.filter(
        (id) => id.toString() !== friendId.toString(),
      );
      await currentUser.save();
    }

    if (friendUser) {
      friendUser.friends = friendUser.friends.filter(
        (id) => id.toString() !== currentUserId.toString(),
      );
      await friendUser.save();
    }

    res.json({ message: "Friend removed successfully" });
  } catch (err) {
    next(err);
  }
};

export const getFriends = async (req, res, next) => {
  try {
    const targetUserId = req.params.userId || req.query.userId || req.user;
    const user = await User.findById(targetUserId).populate(
      "friends",
      "username handle email avatar bio isOnline lastActive",
    );

    res.json(user ? user.friends : []);
  } catch (err) {
    next(err);
  }
};

export const getFriendRequests = async (req, res, next) => {
  try {
    const user = await User.findById(req.user).populate(
      "friendRequestsReceived",
      "username email avatar",
    );

    res.json(user ? user.friendRequestsReceived : []);
  } catch (err) {
    next(err);
  }
};

export const getSuggestedFriends = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user);

    if (!currentUser) {
      return res.json([]);
    }

    const excludedIds = [
      currentUser._id,
      ...currentUser.friends,
      ...currentUser.friendRequestsSent,
      ...currentUser.friendRequestsReceived,
    ];

    const suggested = await User.find({
      _id: { $nin: excludedIds },
    })
      .select("username email avatar isOnline lastActive")
      .limit(10);

    res.json(suggested);
  } catch (err) {
    next(err);
  }
};
