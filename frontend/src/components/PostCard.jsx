import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
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
  Upload,
  CornerDownRight,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80";

// Relative time formatter
function formatTime(dateString) {
  if (!dateString) return "Just now";
  const diff = Math.floor((Date.now() - new Date(dateString)) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(dateString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

// ─── Single Comment Row (with edit/delete ON THE COMMENT CARD ONLY) ───────────────
function CommentRow({ comment, postId, postOwnerId, user, setPosts, depth = 0 }) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [showCommentMenu, setShowCommentMenu] = useState(false);

  // Edit comment states
  const [isEditingComment, setIsEditingComment] = useState(false);
  const [editCommentText, setEditCommentText] = useState(comment.text || "");
  const [savingCommentEdit, setSavingCommentEdit] = useState(false);

  const commentUserId = comment.user?._id || comment.user;
  const currentUserId = user?._id || user?.id;

  // Authorization flags
  const isCommentAuthor = commentUserId === currentUserId;
  const isPostOwner = postOwnerId === currentUserId;
  const canDeleteComment = isCommentAuthor || isPostOwner;
  const canEditComment = isCommentAuthor;

  const commentLiked = comment.likes?.some(
    (l) => (l._id || l) === currentUserId
  );
  const replyCount = comment.replies?.length || 0;

  const handleLikeComment = async () => {
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) => {
        if (p._id !== postId) return p;
        return {
          ...p,
          comments: p.comments.map((c) => {
            if (c._id !== comment._id) return c;
            const alreadyLiked = c.likes?.some((l) => (l._id || l) === currentUserId);
            return {
              ...c,
              likes: alreadyLiked
                ? c.likes.filter((l) => (l._id || l) !== currentUserId)
                : [...(c.likes || []), user],
            };
          }),
        };
      })
    );
    try {
      const updatedPost = await apiRequest(
        `/posts/${postId}/comments/${comment._id}/like`,
        { method: "PUT" }
      );
      setPosts((prev) => prev.map((p) => (p._id === postId ? updatedPost : p)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveCommentEdit = async () => {
    if (!editCommentText.trim() || savingCommentEdit) return;
    try {
      setSavingCommentEdit(true);
      const updatedPost = await apiRequest(
        `/posts/${postId}/comments/${comment._id}`,
        { method: "PUT", body: { text: editCommentText.trim() } }
      );
      setPosts((prev) => prev.map((p) => (p._id === postId ? updatedPost : p)));
      setIsEditingComment(false);
      setShowCommentMenu(false);
      toast.success("Comment updated!");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to update comment");
    } finally {
      setSavingCommentEdit(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      const updatedPost = await apiRequest(
        `/posts/${postId}/comments/${comment._id}`,
        { method: "DELETE" }
      );
      setPosts((prev) => prev.map((p) => (p._id === postId ? updatedPost : p)));
      setShowCommentMenu(false);
      toast.info("Comment deleted.");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to delete comment");
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || sendingReply) return;
    try {
      setSendingReply(true);
      const updatedPost = await apiRequest(
        `/posts/${postId}/comments/${comment._id}/reply`,
        { method: "POST", body: { text: replyText } }
      );
      setPosts((prev) => prev.map((p) => (p._id === postId ? updatedPost : p)));
      setReplyText("");
      setShowReplyInput(false);
      setShowReplies(true);
      toast.success("Reply added!");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to add reply");
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className={`flex gap-2.5 group/commentRow ${depth > 0 ? "ml-9 mt-2" : ""}`}>
      <img
        src={comment.user?.avatar || DEFAULT_AVATAR}
        alt={comment.user?.username}
        className="w-8 h-8 rounded-full object-cover shrink-0 mt-0.5 border border-slate-100"
      />
      <div className="flex-1 min-w-0">
        {/* Comment Card / Inline Editor */}
        {isEditingComment ? (
          <div className="flex items-center gap-1.5 bg-white border border-blue-500 rounded-2xl px-3 py-1.5 max-w-full shadow-xs">
            <input
              type="text"
              value={editCommentText}
              onChange={(e) => setEditCommentText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSaveCommentEdit();
                }
              }}
              className="flex-1 text-xs outline-none text-slate-800 bg-transparent"
              autoFocus
            />
            <button
              onClick={handleSaveCommentEdit}
              disabled={savingCommentEdit}
              className="text-emerald-600 hover:text-emerald-700 cursor-pointer p-0.5"
              title="Save"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsEditingComment(false)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 max-w-full group/card relative">
            {/* Comment Card Bubble */}
            <div className="bg-slate-100/80 border border-slate-200/60 rounded-2xl rounded-tl-sm px-3.5 py-2.5 inline-block max-w-full">
              <span className="text-xs font-bold text-slate-900 block leading-tight">
                {comment.user?.username || "User"}
              </span>
              <p className="text-xs text-slate-800 leading-relaxed mt-0.5 break-words">
                {comment.text}
              </p>
            </div>

            {/* ── Edit & Delete options directly ON THE COMMENT CARD (visible on hover) ── */}
            {(canEditComment || canDeleteComment) && (
              <div className="relative shrink-0 opacity-0 group-hover/card:opacity-100 transition-opacity">
                <button
                  onClick={() => setShowCommentMenu((prev) => !prev)}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer"
                  title="Comment options"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {showCommentMenu && (
                  <div className="absolute left-full top-0 ml-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 w-32 text-xs font-medium">
                    {canEditComment && (
                      <button
                        onClick={() => {
                          setIsEditingComment(true);
                          setEditCommentText(comment.text);
                          setShowCommentMenu(false);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5 text-blue-500" />
                        <span>Edit</span>
                      </button>
                    )}
                    {canDeleteComment && (
                      <button
                        onClick={handleDeleteComment}
                        className="w-full text-left px-3 py-1.5 hover:bg-rose-50 flex items-center gap-2 text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Actions row (Time, Like, Reply ONLY - edit/delete are strictly on the card) */}
        <div className="flex items-center gap-3 mt-1 ml-1 flex-wrap">
          <span className="text-[10px] text-slate-400 font-medium">
            {formatTime(comment.createdAt)}
          </span>

          {/* Like comment */}
          <button
            onClick={handleLikeComment}
            className={`flex items-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer ${
              commentLiked
                ? "text-rose-500"
                : "text-slate-500 hover:text-rose-500"
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 transition-all ${
                commentLiked ? "fill-rose-500 stroke-rose-500 scale-110" : ""
              }`}
            />
            {comment.likes?.length > 0 && (
              <span>{comment.likes.length}</span>
            )}
            <span>Like</span>
          </button>

          {/* Reply button */}
          {depth === 0 && (
            <button
              onClick={() => setShowReplyInput((v) => !v)}
              className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <CornerDownRight className="w-3.5 h-3.5" />
              <span>Reply</span>
            </button>
          )}

          {/* Show/hide replies toggle */}
          {depth === 0 && replyCount > 0 && (
            <button
              onClick={() => setShowReplies((v) => !v)}
              className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
            >
              {showReplies ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
              <span>
                {showReplies ? "Hide" : `${replyCount}`}{" "}
                {replyCount === 1 ? "reply" : "replies"}
              </span>
            </button>
          )}
        </div>

        {/* Reply input */}
        {showReplyInput && depth === 0 && (
          <div className="flex items-center gap-2 mt-2 ml-0.5">
            <img
              src={user?.avatar || DEFAULT_AVATAR}
              alt={user?.username}
              className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-100"
            />
            <div className="flex-1 flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
              <input
                type="text"
                placeholder={`Reply to ${comment.user?.username || "User"}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSendReply();
                  }
                }}
                className="flex-1 text-xs outline-none text-slate-700 bg-transparent"
                autoFocus
              />
              <button
                onClick={handleSendReply}
                disabled={!replyText.trim() || sendingReply}
                className="text-blue-600 disabled:text-slate-300 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Replies list */}
        {showReplies && replyCount > 0 && (
          <div className="mt-2 space-y-2">
            {comment.replies.map((reply, ri) => (
              <div key={reply._id || ri} className="flex gap-2 ml-9">
                <img
                  src={reply.user?.avatar || DEFAULT_AVATAR}
                  alt={reply.user?.username}
                  className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5 border border-slate-100"
                />
                <div className="flex-1 min-w-0">
                  <div className="bg-slate-100/80 border border-slate-200/60 rounded-2xl rounded-tl-sm px-3 py-2 inline-block max-w-full">
                    <span className="text-xs font-bold text-slate-900 block leading-tight">
                      {reply.user?.username || "User"}
                    </span>
                    <p className="text-xs text-slate-800 leading-relaxed mt-0.5 break-words">
                      {reply.text}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-1 ml-1">
                    <span className="text-[10px] text-slate-400 font-medium">
                      {formatTime(reply.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main PostCard ────────────────────────────────────────────────────────────
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
  const [sendingComment, setSendingComment] = useState(false);

  const postOwnerId = post.user?._id || post.user;
  const isOwner = postOwnerId === user?._id || postOwnerId === user?.id;
  const isLiked = post.likes?.some((u) => (u._id || u) === user?._id);

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
          : p
      )
    );
    try {
      const updatedPost = await apiRequest(`/posts/like/${post._id}`, {
        method: "PUT",
      });
      setPosts((prev) =>
        prev.map((p) => (p._id === post._id ? updatedPost : p))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim() || sendingComment) return;
    const optimistic = {
      _id: `temp-${Date.now()}`,
      user,
      text: commentText,
      likes: [],
      replies: [],
      createdAt: new Date(),
    };
    setPosts((prev) =>
      prev.map((p) =>
        p._id === post._id
          ? { ...p, comments: [...(p.comments || []), optimistic] }
          : p
      )
    );
    setCommentText("");
    try {
      setSendingComment(true);
      const updatedPost = await apiRequest(`/posts/comment/${post._id}`, {
        method: "POST",
        body: { text: optimistic.text },
      });
      setPosts((prev) =>
        prev.map((p) => (p._id === post._id ? updatedPost : p))
      );
      toast.success("Comment posted!");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to post comment");
    } finally {
      setSendingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await apiRequest(`/posts/${post._id}`, { method: "DELETE" });
      setPosts((prev) => prev.filter((p) => p._id !== post._id));
      toast.info("Post deleted.");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to delete post");
    }
  };

  const handleUpdate = async () => {
    const formData = new FormData();
    formData.append("text", editText);
    formData.append("location", editLocation);
    if (editImage) formData.append("image", editImage);
    try {
      setEditLoading(true);
      const updatedPost = await apiRequest(`/posts/${post._id}`, {
        method: "PUT",
        body: formData,
      });
      setPosts((prev) =>
        prev.map((p) => (p._id === post._id ? updatedPost : p))
      );
      toast.success("Post updated successfully!");
      setIsEditing(false);
      setShowMenu(false);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to update post");
    } finally {
      setEditLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await apiRequest(`/posts/share/${post._id}`, { method: "POST" });
      setPosts((prev) =>
        prev.map((p) =>
          p._id === post._id
            ? { ...p, sharesCount: (p.sharesCount || 0) + 1 }
            : p
        )
      );
      navigator.clipboard?.writeText(window.location.href);
      setCopiedShare(true);
      toast.success("Post link copied to clipboard!");
      setTimeout(() => setCopiedShare(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const commentCount = post.comments?.length || 0;

  return (
    <div
      className="bg-white rounded-2xl border border-slate-200/80 shadow-xs mb-5 overflow-hidden transition-shadow hover:shadow-sm relative"
      onClick={() => {
        if (showMenu) setShowMenu(false);
      }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <Link to={isOwner ? "/profile" : `/profile/${post.user?._id || post.user}`}>
            <img
              src={post.user?.avatar || DEFAULT_AVATAR}
              alt={post.user?.username}
              className="w-10 h-10 rounded-full object-cover border border-slate-100 hover:opacity-90 transition-opacity"
            />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Link
                to={isOwner ? "/profile" : `/profile/${post.user?._id || post.user}`}
                className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors"
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
            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
              <span>{formatTime(post.createdAt)}</span>
              {post.taggedFriends?.length > 0 && (
                <span className="flex items-center gap-1 text-sky-600 font-medium">
                  <Tag className="w-3 h-3" />
                  with {post.taggedFriends.map((f) => f.username).join(", ")}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Options menu */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setShowMenu((p) => !p)}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1.5 w-40 text-xs font-medium">
              {isOwner ? (
                <>
                  <button
                    onClick={() => { setIsEditing(true); setShowMenu(false); }}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                  >
                    <Pencil className="w-4 h-4 text-blue-500" /> Edit Post
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-rose-500" /> Delete Post
                  </button>
                </>
              ) : (
                <button
                  onClick={handleShare}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-slate-500" /> Share Link
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      {isEditing ? (
        <div className="px-5 pb-4 space-y-3">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full text-sm p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            rows={3}
          />
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
            <input
              type="text"
              placeholder="Edit location"
              value={editLocation}
              onChange={(e) => setEditLocation(e.target.value)}
              className="flex-1 text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
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
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-xs cursor-pointer hover:bg-slate-100"
            >
              <Upload className="w-4 h-4" />
              {editImage ? "Change Image" : "Upload New Image"}
            </label>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3.5 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={editLoading}
              className="px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 cursor-pointer disabled:opacity-60"
            >
              {editLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      ) : (
        <>
          {post.text && (
            <p className="px-5 text-sm text-slate-800 leading-relaxed mb-3">
              {post.text}
            </p>
          )}
          {post.image && (
            <div className="max-h-[480px] overflow-hidden bg-slate-100">
              <img
                src={post.image}
                alt="post"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </>
      )}

      {/* ── Action bar ── */}
      <div className="px-5 py-2.5 flex items-center justify-between text-slate-500 text-xs font-semibold border-t border-slate-100 mt-2">
        {/* Like stats row */}
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          {post.likes?.length > 0 && (
            <>
              <div className="flex items-center justify-center w-4.5 h-4.5 bg-rose-500 rounded-full">
                <Heart className="w-2.5 h-2.5 text-white fill-white" />
              </div>
              <span>{post.likes.length}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          {commentCount > 0 && (
            <button
              onClick={() => setShowComments((p) => !p)}
              className="hover:text-slate-600 cursor-pointer transition-colors"
            >
              {commentCount} {commentCount === 1 ? "comment" : "comments"}
            </button>
          )}
          {post.sharesCount > 0 && (
            <span>{post.sharesCount} shares</span>
          )}
        </div>
      </div>

      {/* ── Main action buttons ── */}
      <div className="px-4 pb-3 flex items-center gap-1 border-t border-slate-100">
        <button
          onClick={handleLike}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            isLiked
              ? "text-rose-500 bg-rose-50 hover:bg-rose-100"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Heart
            className={`w-4 h-4 transition-all ${
              isLiked ? "fill-rose-500 stroke-rose-500 scale-110" : ""
            }`}
          />
          <span>{isLiked ? "Liked" : "Like"}</span>
        </button>

        <button
          onClick={() => setShowComments((p) => !p)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            showComments
              ? "text-blue-600 bg-blue-50"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>Comment</span>
        </button>

        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
        >
          <Share2 className="w-4 h-4 text-slate-500" />
          <span>{copiedShare ? "Copied!" : "Share"}</span>
        </button>
      </div>

      {/* ── Comments Section ── */}
      {showComments && (
        <div className="border-t border-slate-100 px-4 pt-3 pb-4 space-y-3 bg-slate-50/40">
          {/* Existing comments */}
          {post.comments && post.comments.length > 0 && (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
              {post.comments.map((c, i) => (
                <CommentRow
                  key={c._id || i}
                  comment={c}
                  postId={post._id}
                  postOwnerId={postOwnerId}
                  user={user}
                  setPosts={setPosts}
                  depth={0}
                />
              ))}
            </div>
          )}

          {/* Add comment input */}
          <div className="flex items-center gap-2.5 mt-2">
            <img
              src={user?.avatar || DEFAULT_AVATAR}
              alt={user?.username}
              className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-100"
            />
            <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-3.5 py-2 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all shadow-xs">
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
                className="flex-1 text-xs outline-none text-slate-700 bg-transparent placeholder-slate-400"
              />
              <button
                onClick={handleComment}
                disabled={!commentText.trim() || sendingComment}
                className="text-blue-600 disabled:text-slate-300 transition-colors cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
