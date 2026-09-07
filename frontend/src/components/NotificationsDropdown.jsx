import { useState } from "react";
import { useNotifications } from "../context/NotificationContext";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  Share2,
  MessageCircle,
  UserPlus,
  UserCheck,
  CheckCheck,
  Trash2,
  X,
  Bell,
  Check,
} from "lucide-react";

export default function NotificationsDropdown({ onClose }) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotifications();

  const [filter, setFilter] = useState("all"); // 'all' | 'unread'
  const navigate = useNavigate();

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    return true;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case "like":
        return <Heart className="w-3 h-3 text-white fill-white" />;
      case "share":
        return <Share2 className="w-3 h-3 text-white" />;
      case "comment":
        return <MessageCircle className="w-3 h-3 text-white fill-white" />;
      case "friend_request":
        return <UserPlus className="w-3 h-3 text-white" />;
      case "friend_accept":
        return <UserCheck className="w-3 h-3 text-white" />;
      default:
        return <Bell className="w-3 h-3 text-white" />;
    }
  };

  const getNotificationBadgeBg = (type) => {
    switch (type) {
      case "like":
        return "bg-rose-500";
      case "share":
        return "bg-blue-500";
      case "comment":
        return "bg-indigo-500";
      case "friend_request":
        return "bg-emerald-500";
      case "friend_accept":
        return "bg-amber-500";
      default:
        return "bg-slate-500";
    }
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      await markAsRead(notif._id);
    }
    onClose();

    if (notif.type === "friend_request" || notif.type === "friend_accept") {
      if (notif.sender?._id) {
        navigate(`/profile/${notif.sender._id}`);
      } else {
        navigate("/friends");
      }
    } else if (notif.post) {
      navigate("/home");
    }
  };

  return (
    <div className="absolute right-0 top-12 w-[calc(100vw-1rem)] sm:w-80 md:w-96 bg-white border border-slate-200 shadow-2xl rounded-2xl z-50 text-slate-800 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-sm text-slate-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-[11px] font-extrabold bg-blue-600 text-white px-2 py-0.5 rounded-full shadow-xs">
              {unreadCount} new
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {notifications.length > 0 && (
            <>
              <button
                onClick={markAllAsRead}
                title="Mark all as read"
                className="p-1.5 hover:bg-slate-200/70 rounded-lg text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
              <button
                onClick={clearAllNotifications}
                title="Clear all notifications"
                className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200/70 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center px-4 py-1.5 border-b border-slate-100 gap-2 bg-white text-xs font-semibold">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
            filter === "all"
              ? "bg-blue-50 text-blue-600 font-bold"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
            filter === "unread"
              ? "bg-blue-50 text-blue-600 font-bold"
              : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          Unread {unreadCount > 0 && `(${unreadCount})`}
        </button>
      </div>

      {/* Notifications List */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 scrollbar-thin">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-semibold">No notifications found</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => handleNotificationClick(notif)}
              className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer relative group ${
                notif.read ? "bg-white hover:bg-slate-50" : "bg-blue-50/40 hover:bg-blue-50/70"
              }`}
            >
              {/* Avatar + Type badge */}
              <div className="relative shrink-0 mt-0.5">
                <img
                  src={
                    notif.sender?.avatar ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                  }
                  alt={notif.sender?.username || "User"}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-xs"
                />
                <span
                  className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white ${getNotificationBadgeBg(
                    notif.type
                  )}`}
                >
                  {getNotificationIcon(notif.type)}
                </span>
              </div>

              {/* Body */}
              <div className="flex-1 min-w-0 pr-5">
                <p className="text-xs text-slate-700 leading-snug">
                  <span className="font-bold text-slate-900 hover:underline">
                    {notif.sender?.username || "Someone"}
                  </span>{" "}
                  {notif.type === "like" && "liked your post."}
                  {notif.type === "share" && "shared your post."}
                  {notif.type === "comment" && "commented on your post."}
                  {notif.type === "friend_request" && "sent you a friend request."}
                  {notif.type === "friend_accept" && "accepted your friend request."}
                </p>

                {/* Post Preview Snippet */}
                {notif.post && (notif.post.text || notif.post.image) && (
                  <div className="mt-1.5 p-1.5 bg-slate-100/70 rounded-lg text-[11px] text-slate-500 truncate border border-slate-200/50">
                    {notif.post.text ? (
                      <span>"{notif.post.text}"</span>
                    ) : (
                      <span className="italic">📷 Photo post</span>
                    )}
                  </div>
                )}

                <span className="text-[10px] text-slate-400 font-medium mt-1 block">
                  {formatTimeAgo(notif.createdAt)}
                </span>
              </div>

              {/* Unread indicator dot */}
              {!notif.read && (
                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 self-center" />
              )}

              {/* Delete button on hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(notif._id);
                }}
                className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-all cursor-pointer"
                title="Delete notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
