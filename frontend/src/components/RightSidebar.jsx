import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { apiRequest } from "../lib/api";
import { useSocket } from "../context/SocketContext";
import { Check, X, MessageSquare, Loader2 } from "lucide-react";

export default function RightSidebar() {
  const navigate = useNavigate();
  const socketContext = useSocket();
  const onlineUsers = socketContext?.onlineUsers || [];
  const [suggestions, setSuggestions] = useState([]);
  const [activities, setActivities] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sentRequests, setSentRequests] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const fetchSidebarData = async () => {
      try {
        setLoading(true);
        const [suggestedRes, postsRes, friendsRes] = await Promise.allSettled([
          apiRequest("/friends/suggested"),
          apiRequest("/posts?limit=6"),
          apiRequest("/friends"),
        ]);

        if (!isMounted) return;

        if (suggestedRes.status === "fulfilled" && Array.isArray(suggestedRes.value)) {
          setSuggestions(suggestedRes.value);
        }

        if (postsRes.status === "fulfilled") {
          const rawPosts = postsRes.value?.posts || (Array.isArray(postsRes.value) ? postsRes.value : []);
          setActivities(rawPosts);
        }

        if (friendsRes.status === "fulfilled" && Array.isArray(friendsRes.value)) {
          setFriends(friendsRes.value);
        }
      } catch (err) {
        console.error("Error fetching RightSidebar data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSidebarData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleFollow = async (userId) => {
    try {
      setSentRequests((prev) => [...prev, userId]);
      await apiRequest(`/friends/request/${userId}`, { method: "POST" });
      toast.success("Friend request sent!");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to send request");
      setSentRequests((prev) => prev.filter((id) => id !== userId));
    }
  };

  const handleDismiss = (userId) => {
    setSuggestions((prev) => prev.filter((s) => (s._id || s.id) !== userId));
  };

  const formatTime = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const diffSec = Math.floor((new Date() - date) / 1000);
    if (diffSec < 60) return "Just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  };

  // Check if a user is online strictly via real-time Socket onlineUsers list
  const isOnline = (userObj) => {
    if (!userObj) return false;
    const uid = (userObj._id || userObj.id || userObj).toString();
    return onlineUsers.some((id) => id?.toString() === uid);
  };

  // Sort friends: online first
  const sortedFriends = [...friends].sort((a, b) => {
    const aOn = isOnline(a);
    const bOn = isOnline(b);
    if (aOn && !bOn) return -1;
    if (!aOn && bOn) return 1;
    return 0;
  });

  return (
    <aside className="w-72 xl:w-80 shrink-0 hidden lg:block sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto p-3.5 space-y-4 scrollbar-thin">
      {/* ── Suggestions For You ── */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
          Suggestions For You
        </h3>
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          </div>
        ) : suggestions.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No new suggestions</p>
        ) : (
          <div className="space-y-2.5">
            {suggestions.slice(0, 5).map((user) => {
              const uId = user._id || user.id;
              const isSent = sentRequests.includes(uId);
              return (
                <div
                  key={uId}
                  className="flex items-center justify-between gap-2"
                >
                  <Link
                    to={`/profile/${uId}`}
                    className="flex items-center gap-2 min-w-0 group"
                  >
                    <img
                      src={
                        user.avatar ||
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                      }
                      alt={user.username}
                      className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-100"
                    />
                    <span className="text-xs font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                      {user.username}
                    </span>
                  </Link>
                  <div className="flex items-center gap-1 shrink-0">
                    {isSent ? (
                      <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <Check className="w-3 h-3" /> Sent
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleFollow(uId)}
                          className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all shadow-xs cursor-pointer"
                        >
                          Follow
                        </button>
                        <button
                          onClick={() => handleDismiss(uId)}
                          className="bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 text-[11px] font-semibold px-2 py-1 rounded-lg transition-all cursor-pointer"
                          title="Dismiss"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Latest Activities ── */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
          Latest Activities
        </h3>
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          </div>
        ) : activities.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {activities.map((post) => {
              const author = post.user || {};
              const authorName = author.username || "Someone";
              const authorAvatar =
                author.avatar ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80";

              let actionText = "posted an update.";
              if (post.image) actionText = "shared a new photo.";
              else if (post.video) actionText = "shared a video.";
              else if (post.text) {
                actionText = `posted: "${post.text.length > 25 ? post.text.slice(0, 25) + "..." : post.text}"`;
              }

              return (
                <div key={post._id} className="flex items-start gap-2.5 text-xs">
                  <Link to={`/profile/${author._id || ""}`} className="shrink-0">
                    <img
                      src={authorAvatar}
                      alt={authorName}
                      className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-100 mt-0.5"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-700 leading-snug">
                      <Link
                        to={`/profile/${author._id || ""}`}
                        className="font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                      >
                        {authorName}
                      </Link>{" "}
                      <span className="text-slate-600">{actionText}</span>
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 whitespace-nowrap pt-0.5">
                    {formatTime(post.createdAt)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Online Friends ── */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
          Online Friends ({sortedFriends.filter(isOnline).length})
        </h3>
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          </div>
        ) : sortedFriends.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No friends added yet</p>
        ) : (
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {sortedFriends.map((friend) => {
              const fId = friend._id || friend.id;
              const online = isOnline(friend);
              return (
                <div
                  key={fId}
                  onClick={() => navigate(`/messages?user=${fId}`)}
                  className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={
                          friend.avatar ||
                          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                        }
                        alt={friend.username}
                        className="w-8 h-8 rounded-full object-cover border border-slate-100"
                      />
                      {online && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 truncate">
                      {friend.username}
                    </span>
                  </div>

                  <MessageSquare className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
