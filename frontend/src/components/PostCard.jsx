import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../lib/api";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Send,
  MapPin,
  Tag,
  Pencil,
  Trash2,
  X,
  Check,
  Upload,
} from "lucide-react";

export default function PostCard({ post, setPosts }) {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(post.text || "");
  const [editLocation, setEditLocation] = useState(post.location || "");
  const [editImage, setEditImage] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const isOwner = post.user?._id === user?._id || post.user === user?._id;
  const isLiked = post.likes?.some((u) => (u._id || u) === user?._id);

  // Format relative timestamp
  const formatTime = (dateString) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString();
  };

  const handleLike = async () => {
    setPosts((prev) =>
      prev.map((p) =>
        p._id === post._id
          ? {
              ...p,
              likes: p.likes?.some((u) => (u._id || u) === user?._id)
                ? p.likes.filter((u) => (u._id || u) !== user?._id)
                : [...(p.likes || []), user],
            }
          : p,
      ),
    );

    try {
      const updatedPost = await apiRequest(`/posts/like/${post._id}`, {
        method: "PUT",
      });

      setPosts((prev) =>
        prev.map((p) => (p._id === post._id ? updatedPost : p)),
      );
    } catch (err) {
      console.log(err);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;

    const newComment = {
      user,
      text: commentText,
      createdAt: new Date(),
    };

    setPosts((prev) =>
      prev.map((p) =>
        p._id === post._id
          ? {
              ...p,
              comments: [...(p.comments || []), newComment],
            }
          : p,
      ),
    );

    setCommentText("");

    try {
      const updatedPost = await apiRequest(`/posts/comment/${post._id}`, {
        method: "POST",
        body: { text: newComment.text },
      });

      setPosts((prev) =>
        prev.map((p) => (p._id === post._id ? updatedPost : p)),
      );
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await apiRequest(`/posts/${post._id}`, {
        method: "DELETE",
      });

      setPosts((prev) => prev.filter((p) => p._id !== post._id));
    } catch (err) {
      console.log(err);
    }
  };

  const handleUpdate = async () => {
    const formData = new FormData();
    formData.append("text", editText);
    formData.append("location", editLocation);

    if (editImage) {
      formData.append("image", editImage);
    }

    try {
      setEditLoading(true);

      const updatedPost = await apiRequest(`/posts/${post._id}`, {
        method: "PUT",
        body: formData,
      });

      setPosts((prev) =>
        prev.map((p) => (p._id === post._id ? updatedPost : p)),
      );

      setIsEditing(false);
      setShowMenu(false);
    } catch (err) {
      console.log(err);
    } finally {
      setEditLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await apiRequest(`/posts/share/${post._id}`, {
        method: "POST",
      });

      setPosts((prev) =>
        prev.map((p) =>
          p._id === post._id
            ? { ...p, sharesCount: (p.sharesCount || 0) + 1 }
            : p,
        ),
      );

      navigator.clipboard?.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs mb-5 transition-shadow hover:shadow-sm relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-3">
          <Link to={isOwner ? "/profile" : `/profile/${post.user?._id || post.user}`}>
            <img
              src={
                post.user?.avatar ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
              }
              alt={post.user?.username || "User"}
              className="w-10 h-10 rounded-full object-cover border border-slate-100 hover:opacity-90 transition-opacity"
            />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Link
                to={isOwner ? "/profile" : `/profile/${post.user?._id || post.user}`}
                className="text-sm font-semibold text-slate-800 leading-tight hover:text-blue-600 transition-colors"
              >
                {post.user?.username || "Crowdly User"}
              </Link>
              {post.location && (
                <span className="inline-flex items-center gap-1 text-[11px] text-rose-500 font-medium bg-rose-50 px-2 py-0.5 rounded-full">
                  <MapPin className="w-3 h-3" />
                  {post.location}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
              <span>{formatTime(post.createdAt)}</span>
              {post.taggedFriends && post.taggedFriends.length > 0 && (
                <span className="flex items-center gap-1 text-sky-600 font-medium">
                  <Tag className="w-3 h-3" />
                  with {post.taggedFriends.map((f) => f.username).join(", ")}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Options Menu Button */}
        <div className="relative">
          <button
            onClick={() => setShowMenu((prev) => !prev)}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {/* Options Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 w-36 text-xs">
              {isOwner ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5 text-blue-500" />
                    <span>Edit Post</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Delete Post</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleShare}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Share Link</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Mode Form */}
      {isEditing ? (
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4 space-y-3">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
            rows={3}
          />
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-500" />
            <input
              type="text"
              placeholder="Edit location"
              value={editLocation}
              onChange={(e) => setEditLocation(e.target.value)}
              className="flex-1 text-xs p-1.5 bg-white border border-slate-200 rounded-lg outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              id={`edit-file-${post._id}`}
              className="hidden"
              onChange={(e) => setEditImage(e.target.files[0])}
            />
            <label
              htmlFor={`edit-file-${post._id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs cursor-pointer hover:bg-slate-100"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{editImage ? "Change Image" : "Upload New Image"}</span>
            </label>
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={editLoading}
              className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 cursor-pointer"
            >
              {editLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      ) : (
        /* Post Content Body */
        <>
          {post.text && (
            <p className="text-slate-700 text-sm leading-relaxed mb-4">
              {post.text}
            </p>
          )}

          {/* Post Image */}
          {post.image && (
            <div className="rounded-xl overflow-hidden mb-4 max-h-[420px] bg-slate-100 border border-slate-100">
              <img
                src={post.image}
                alt="post visual"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </>
      )}

      {/* Action Footer Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-slate-500 text-xs font-medium">
        <div className="flex items-center gap-6">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 hover:text-rose-500 transition-colors cursor-pointer ${
              isLiked ? "text-rose-500 font-semibold" : ""
            }`}
          >
            <Heart
              className={`w-4 h-4 ${isLiked ? "fill-rose-500 stroke-rose-500" : ""}`}
            />
            <span>{post.likes?.length || 0} Likes</span>
          </button>

          <button
            onClick={() => setShowComments((prev) => !prev)}
            className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>
              {post.comments?.length || 0}{" "}
              {post.comments?.length === 1 ? "Comment" : "Comments"}
            </span>
          </button>
        </div>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <Share2 className="w-4 h-4 text-slate-400" />
          <span>{copiedShare ? "Link Copied!" : `${post.sharesCount || 0} Shares`}</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
          {/* Existing Comments List */}
          {post.comments && post.comments.length > 0 && (
            <div className="space-y-2 mb-3 max-h-48 overflow-y-auto pr-1">
              {post.comments.map((c, i) => (
                <div key={i} className="flex items-start gap-2 text-xs bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <img
                    src={c.user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"}
                    alt={c.user?.username || "User"}
                    className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-slate-800 block">
                      {c.user?.username || "User"}
                    </span>
                    <span className="text-slate-600 leading-snug">{c.text}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {formatTime(c.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Add Comment Input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleComment();
                }
              }}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={handleComment}
              disabled={!commentText.trim()}
              className="p-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
