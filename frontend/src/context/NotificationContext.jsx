import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiRequest } from "../lib/api";
import { useAuth } from "./AuthContext";
import { useSocket } from "./SocketContext";
import { toast } from "react-toastify";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user?._id) return;
    try {
      setLoading(true);
      const res = await apiRequest("/notifications");
      setNotifications(res || []);
      const unread = (res || []).filter((n) => !n.read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    if (user?._id) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user?._id, fetchNotifications]);

  // Real-time socket notification listener
  useEffect(() => {
    const sock = socket?.current;
    if (!sock || !user?._id) return;

    const handleNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Toast popup alert
      const senderName = notification.sender?.username || "Someone";
      let msg = "";
      if (notification.type === "like") msg = `${senderName} liked your post.`;
      else if (notification.type === "share") msg = `${senderName} shared your post.`;
      else if (notification.type === "comment") msg = `${senderName} commented on your post.`;
      else if (notification.type === "friend_request") msg = `${senderName} sent you a friend request.`;
      else if (notification.type === "friend_accept") msg = `${senderName} accepted your friend request.`;
      else msg = `${senderName} sent a notification.`;

      toast.info(msg, {
        icon: "🔔",
      });
    };

    sock.on("newNotification", handleNewNotification);

    return () => {
      sock.off("newNotification", handleNewNotification);
    };
  }, [socket, user?._id]);

  const markAsRead = async (id) => {
    try {
      await apiRequest(`/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiRequest("/notifications/read-all", { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await apiRequest(`/notifications/${id}`, { method: "DELETE" });
      setNotifications((prev) => {
        const target = prev.find((n) => n._id === id);
        if (target && !target.read) {
          setUnreadCount((uc) => Math.max(0, uc - 1));
        }
        return prev.filter((n) => n._id !== id);
      });
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await apiRequest("/notifications", { method: "DELETE" });
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return ctx;
}
