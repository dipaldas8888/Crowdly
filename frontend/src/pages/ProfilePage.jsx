import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { apiRequest } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import PostCard from "../components/PostCard";
import CreatePost from "../components/CreatePost";
import {
  BadgeCheck,
  Calendar,
  Bookmark,
  MessageSquare,
  Pencil,
  Heart,
  MessageCircle,
  Camera,
  X,
  Loader2,
  Film,
  Image as ImageIcon,
  FileText,
  Users,
  UserCheck,
  UserPlus,
  ChevronRight,
  Search,
  Share2,
  Check,
  Sparkles,
} from "lucide-react";

export default function ProfilePage() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  // Determine whose profile to show
  const isOwnProfile = !id || id === "me" || id === currentUser?._id;
  const profileUserId = isOwnProfile ? currentUser?._id : id;

  const [profileUser, setProfileUser] = useState(null);
  const [stats, setStats] = useState({
    postsCount: 0,
    photosCount: 0,
    videosCount: 0,
    likesCount: 0,
    likedPostsCount: 0,
    followersCount: 0,
    friendsCount: 0,
    groupsCount: 0,
  });

  // Tab state: "posts" | "photos" | "videos" | "friends"
  const [activeTab, setActiveTab] = useState("posts");
  const [posts, setPosts] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendSearchQuery, setFriendSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);

  // Friend status state for viewing other profiles
  const [friendStatus, setFriendStatus] = useState("none"); // "none" | "sent" | "received" | "friends"
  const [friendActionLoading, setFriendActionLoading] = useState(false);

  // Edit Profile modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editHandle, setEditHandle] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatar, setEditAvatar] = useState(null);
  const [editCover, setEditCover] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Photo Lightbox modal state
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Fetch profile info + stats
  const fetchProfileData = useCallback(async () => {
    if (!profileUserId) return;
    try {
      setLoading(true);
      const res = await apiRequest(`/users/profile/${profileUserId}`);
      setProfileUser(res.user);
      setStats(res.stats || {});
      setEditUsername(res.user?.username || "");
      setEditHandle(res.user?.handle || "");
      setEditBio(res.user?.bio || "");

      // Determine friend status if viewing another profile
      if (currentUser && currentUser._id !== profileUserId) {
        const myFriends = currentUser.friends || [];
        const mySent = currentUser.friendRequestsSent || [];
        const myReceived = currentUser.friendRequestsReceived || [];

        if (myFriends.some((f) => (f._id || f).toString() === profileUserId)) {
          setFriendStatus("friends");
        } else if (mySent.some((s) => (s._id || s).toString() === profileUserId)) {
          setFriendStatus("sent");
        } else if (myReceived.some((r) => (r._id || r).toString() === profileUserId)) {
          setFriendStatus("received");
        } else {
          setFriendStatus("none");
        }
      }

      // Fetch friends list for profile
      const friendsData = await apiRequest(`/friends?userId=${profileUserId}`);
      setFriends(Array.isArray(friendsData) ? friendsData : []);
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  }, [profileUserId, currentUser]);

  // Fetch content for active tab
  const fetchTabContent = useCallback(async (tab) => {
    if (!profileUserId) return;
    try {
      setContentLoading(true);
      if (tab === "posts") {
        const data = await apiRequest(`/users/profile/${profileUserId}/posts`);
        setPosts(Array.isArray(data) ? data : []);
      } else if (tab === "photos") {
        const data = await apiRequest(`/users/profile/${profileUserId}/photos`);
        setPhotos(Array.isArray(data) ? data : []);
      } else if (tab === "videos") {
        const data = await apiRequest(`/users/profile/${profileUserId}/videos`);
        setVideos(Array.isArray(data) ? data : []);
      } else if (tab === "friends") {
        const data = await apiRequest(`/friends?userId=${profileUserId}`);
        setFriends(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(`Error fetching ${tab}:`, err);
    } finally {
      setContentLoading(false);
    }
  }, [profileUserId]);

  useEffect(() => {
    if (profileUserId) {
      fetchProfileData();
    }
  }, [fetchProfileData, profileUserId]);

  useEffect(() => {
    if (profileUser && profileUserId) {
      fetchTabContent(activeTab);
    }
  }, [activeTab, profileUser, fetchTabContent]);

  // Handle Friend Actions (Send, Accept, Cancel)
  const handleFriendAction = async () => {
    if (!profileUserId || friendActionLoading) return;
    try {
      setFriendActionLoading(true);
      if (friendStatus === "none") {
        await apiRequest(`/friends/request/${profileUserId}`, { method: "POST" });
        setFriendStatus("sent");
        toast.success("Friend request sent!");
      } else if (friendStatus === "received") {
        await apiRequest(`/friends/accept/${profileUserId}`, { method: "POST" });
        setFriendStatus("friends");
        toast.success("Friend request accepted!");
        setStats((prev) => ({ ...prev, friendsCount: (prev.friendsCount || 0) + 1 }));
      } else if (friendStatus === "friends") {
        await apiRequest(`/friends/${profileUserId}`, { method: "DELETE" });
        setFriendStatus("none");
        toast.info("Removed from friends");
        setStats((prev) => ({ ...prev, friendsCount: Math.max(0, (prev.friendsCount || 0) - 1) }));
      }
    } catch (err) {
      console.error("Friend action error:", err);
      toast.error(err.message || "Action failed");
    } finally {
      setFriendActionLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("username", editUsername);
    formData.append("handle", editHandle);
    formData.append("bio", editBio);
    if (editAvatar) formData.append("avatar", editAvatar);
    if (editCover) formData.append("coverImage", editCover);

    try {
      setSavingProfile(true);
      const updatedUser = await apiRequest("/users/profile", {
        method: "PUT",
        body: formData,
      });
      setProfileUser(updatedUser);
      setShowEditModal(false);
      setAvatarPreview(null);
      setCoverPreview(null);
      toast.success("Profile updated successfully!");
      fetchProfileData();
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleShareProfile = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Profile link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-9 h-9 animate-spin text-blue-600" />
          <p className="text-xs font-semibold text-slate-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  const userDisplayName = profileUser?.username || "User";
  const userHandle =
    profileUser?.handle ||
    `@${userDisplayName.toLowerCase().replace(/\s+/g, "")}`;
  const userBio = profileUser?.bio || "No bio added yet.";

  const filteredFriendsList = friends.filter((f) =>
    f.username.toLowerCase().includes(friendSearchQuery.toLowerCase()) ||
    (f.handle && f.handle.toLowerCase().includes(friendSearchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 antialiased flex flex-col">
      <Navbar />

      <div className="flex flex-1 w-full max-w-[1600px] mx-auto justify-between items-start">
        <LeftSidebar />

        <main className="flex-1 min-w-0 max-w-4xl mx-auto py-4 sm:py-6 px-3 sm:px-4 md:px-8 w-full space-y-4 sm:space-y-6 pb-16 md:pb-6">

          {/* ── STUNNING COVER & PROFILE HERO CARD ── */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden relative transition-all">
            {/* Cover Banner */}
            <div className="h-60 sm:h-72 md:h-80 bg-slate-900 relative overflow-hidden group">
              <img
                src={
                  profileUser?.coverImage ||
                  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80"
                }
                alt="Cover"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/20 to-transparent" />

              {isOwnProfile && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="absolute bottom-4 right-4 flex items-center gap-2 px-3.5 py-2 bg-black/50 hover:bg-black/80 backdrop-blur-md text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer border border-white/20"
                >
                  <Camera className="w-4 h-4 text-amber-300" />
                  <span>Edit Cover Photo</span>
                </button>
              )}
            </div>

            {/* Profile Avatar & Primary Header Row */}
            <div className="-mt-16 sm:-mt-20 px-6 sm:px-8 pb-6 relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-100">
              {/* Avatar + Online Indicator */}
              <div className="flex items-end gap-4">
                <div className="relative group shrink-0">
                  <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full ring-4 ring-white shadow-2xl overflow-hidden bg-white relative">
                    <img
                      src={
                        profileUser?.avatar ||
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                      }
                      alt={userDisplayName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Online Badge */}
                  {profileUser?.isOnline && (
                    <span
                      className="absolute bottom-2 right-2 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full shadow-sm"
                      title="Online Now"
                    />
                  )}

                  {isOwnProfile && (
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="absolute bottom-2 left-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-transform hover:scale-110 cursor-pointer"
                      title="Update Avatar"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Name & Handle Snippet (Desktop View alignment) */}
                <div className="hidden sm:block pb-2">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                      {userDisplayName}
                    </h1>
                    <BadgeCheck className="w-6 h-6 text-blue-500 fill-blue-50 shrink-0" />
                  </div>
                  <p className="text-xs font-bold text-slate-500">{userHandle}</p>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-end pt-2 sm:pt-0">
                {isOwnProfile ? (
                  <>
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all hover:scale-102 flex items-center gap-2 cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit Profile</span>
                    </button>
                    <button
                      onClick={handleShareProfile}
                      className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer border border-slate-200"
                      title="Share Profile Link"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    {/* Friend Status Action Button */}
                    <button
                      onClick={handleFriendAction}
                      disabled={friendActionLoading}
                      className={`px-5 py-2.5 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer ${
                        friendStatus === "friends"
                          ? "bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200"
                          : friendStatus === "sent"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : friendStatus === "received"
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
                          : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
                      }`}
                    >
                      {friendActionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : friendStatus === "friends" ? (
                        <>
                          <UserCheck className="w-4 h-4 text-emerald-600" />
                          <span>Friends</span>
                        </>
                      ) : friendStatus === "sent" ? (
                        <>
                          <Check className="w-4 h-4 text-amber-600" />
                          <span>Request Sent</span>
                        </>
                      ) : friendStatus === "received" ? (
                        <>
                          <UserPlus className="w-4 h-4 text-white" />
                          <span>Accept Request</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 text-white" />
                          <span>Add Friend</span>
                        </>
                      )}
                    </button>

                    {/* Chat / Message Button */}
                    <button
                      onClick={() => navigate(`/messages?user=${profileUser?._id}`)}
                      className="px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-2 border border-blue-200/60"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Message</span>
                    </button>

                    <button
                      onClick={handleShareProfile}
                      className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer border border-slate-200"
                      title="Share Profile Link"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Name & Bio Info Header */}
            <div className="px-6 pt-4 sm:hidden">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900">{userDisplayName}</h1>
                <BadgeCheck className="w-5 h-5 text-blue-500 fill-blue-50 shrink-0" />
              </div>
              <p className="text-xs font-bold text-slate-500">{userHandle}</p>
            </div>

            {/* Bio & Joined Metadata Row */}
            <div className="px-6 sm:px-8 py-4 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <p className="text-slate-700 leading-relaxed max-w-xl font-medium">
                {userBio}
              </p>

              <div className="flex items-center gap-3 text-slate-500 font-semibold shrink-0">
                <span className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200/80 shadow-2xs">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  <span>
                    Joined{" "}
                    {new Date(
                      profileUser?.createdAt || Date.now()
                    ).toLocaleDateString(undefined, {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </span>
                {profileUser?.isOnline && (
                  <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200/60 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Active Now</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── STATS METRICS BAR ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5 hover:shadow-sm transition-all">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 leading-tight">
                  {stats.postsCount || 0}
                </h3>
                <span className="text-xs font-semibold text-slate-500">Posts</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5 hover:shadow-sm transition-all">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 leading-tight">
                  {friends.length || stats.friendsCount || 0}
                </h3>
                <span className="text-xs font-semibold text-slate-500">Friends</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5 hover:shadow-sm transition-all">
              <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 leading-tight">
                  {stats.photosCount || 0}
                </h3>
                <span className="text-xs font-semibold text-slate-500">Photos</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3.5 hover:shadow-sm transition-all">
              <div className="w-11 h-11 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 leading-tight">
                  {stats.videosCount || 0}
                </h3>
                <span className="text-xs font-semibold text-slate-500">Videos</span>
              </div>
            </div>
          </div>

          {/* ── MAIN CONTENT GRID: Left Info Sidebar + Right Tabbed Content ── */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

            {/* Left Column Cards (Friends & Photos Preview) */}
            <div className="md:col-span-4 space-y-4">

              {/* Friends Preview Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Friends</h3>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {friends.length} {friends.length === 1 ? "friend" : "friends"}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("friends")}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>See All</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {friends.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No friends added yet.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {friends.slice(0, 6).map((friend) => (
                      <Link
                        key={friend._id}
                        to={`/profile/${friend._id}`}
                        className="group flex flex-col items-center text-center"
                      >
                        <div className="relative">
                          <img
                            src={
                              friend.avatar ||
                              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                            }
                            alt={friend.username}
                            className="w-14 h-14 rounded-2xl object-cover border border-slate-200 group-hover:scale-105 transition-transform"
                          />
                          {friend.isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-slate-800 group-hover:text-blue-600 truncate w-full mt-1">
                          {friend.username}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Photos Preview Card */}
              {photos.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Photos</h3>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {photos.length} {photos.length === 1 ? "photo" : "photos"}
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab("photos")}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>See All</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {photos.slice(0, 6).map((photo) => (
                      <div
                        key={photo._id}
                        onClick={() => setSelectedPhoto(photo)}
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer group relative bg-slate-100"
                      >
                        <img
                          src={photo.image}
                          alt="Photo"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Tab Bar & Tab Content */}
            <div className="md:col-span-8 space-y-4">
              {/* Tab navigation pills */}
              <div className="bg-white rounded-2xl p-1.5 border border-slate-200/80 shadow-2xs flex items-center gap-1 overflow-x-auto">
                {[
                  {
                    key: "posts",
                    label: "Posts",
                    count: stats.postsCount || 0,
                    icon: FileText,
                  },
                  {
                    key: "photos",
                    label: "Photos",
                    count: stats.photosCount || 0,
                    icon: ImageIcon,
                  },
                  {
                    key: "videos",
                    label: "Videos",
                    count: stats.videosCount || 0,
                    icon: Film,
                  },
                  {
                    key: "friends",
                    label: "Friends",
                    count: friends.length || stats.friendsCount || 0,
                    icon: Users,
                  },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded-md font-bold ${
                          isActive
                            ? "bg-blue-700 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* --- Posts Tab --- */}
              {activeTab === "posts" && (
                <div className="space-y-4">
                  {isOwnProfile && (
                    <CreatePost
                      setPosts={(updaterOrPost) => {
                        if (typeof updaterOrPost === "function") {
                          setPosts(updaterOrPost);
                        } else {
                          setPosts((prev) => [updaterOrPost, ...prev]);
                        }
                        setStats((prev) => ({
                          ...prev,
                          postsCount: (prev.postsCount || 0) + 1,
                        }));
                      }}
                    />
                  )}

                  {contentLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="bg-white rounded-2xl h-44 animate-pulse border border-slate-200"
                        />
                      ))}
                    </div>
                  ) : posts.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400">
                      <FileText className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                      <p className="text-sm font-bold text-slate-700">No posts yet.</p>
                      {isOwnProfile && (
                        <p className="text-xs text-slate-400 mt-1">
                          Share your thoughts or photos above!
                        </p>
                      )}
                    </div>
                  ) : (
                    posts.map((post) => (
                      <PostCard key={post._id} post={post} setPosts={setPosts} />
                    ))
                  )}
                </div>
              )}

              {/* --- Photos Tab --- */}
              {activeTab === "photos" && (
                <div>
                  {contentLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                          key={i}
                          className="bg-white rounded-2xl aspect-square animate-pulse border border-slate-200"
                        />
                      ))}
                    </div>
                  ) : photos.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400">
                      <ImageIcon className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                      <p className="text-sm font-bold text-slate-700">No photos shared yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {photos.map((post) => (
                        <div
                          key={post._id}
                          onClick={() => setSelectedPhoto(post)}
                          className="bg-slate-200 rounded-2xl overflow-hidden group relative cursor-pointer shadow-2xs hover:shadow-md transition-all duration-300 aspect-square"
                        >
                          <img
                            src={post.image}
                            alt="Photo"
                            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                            <div className="flex items-center gap-3 text-white text-xs font-bold">
                              <span className="flex items-center gap-1">
                                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                                {post.likes?.length || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="w-3.5 h-3.5 text-blue-400" />
                                {post.comments?.length || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* --- Videos Tab --- */}
              {activeTab === "videos" && (
                <div>
                  {contentLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="bg-white rounded-2xl h-56 animate-pulse border border-slate-200"
                        />
                      ))}
                    </div>
                  ) : videos.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400">
                      <Film className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                      <p className="text-sm font-bold text-slate-700">No videos posted yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {videos.map((post) => (
                        <div
                          key={post._id}
                          className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden group hover:shadow-md transition-all"
                        >
                          <div className="relative bg-black h-56 flex items-center justify-center">
                            <video
                              src={post.video}
                              controls
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="p-3.5">
                            <p className="text-xs text-slate-800 font-semibold truncate">
                              {post.text || "Video clip"}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-slate-400 text-xs font-medium">
                              <span className="flex items-center gap-1">
                                <Heart className="w-3.5 h-3.5 text-rose-500" />
                                {post.likes?.length || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="w-3.5 h-3.5 text-blue-500" />
                                {post.comments?.length || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* --- Friends Tab --- */}
              {activeTab === "friends" && (
                <div className="space-y-4">
                  {/* Search Bar within Friends tab */}
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search friends..."
                      value={friendSearchQuery}
                      onChange={(e) => setFriendSearchQuery(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 outline-none focus:border-blue-600 transition-all shadow-2xs"
                    />
                  </div>

                  {contentLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="bg-white rounded-2xl h-24 animate-pulse border border-slate-200"
                        />
                      ))}
                    </div>
                  ) : filteredFriendsList.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400">
                      <Users className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                      <p className="text-sm font-bold text-slate-700">No friends found.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filteredFriendsList.map((friend) => (
                        <div
                          key={friend._id}
                          className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex items-center justify-between gap-3 hover:shadow-md transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Link to={`/profile/${friend._id}`} className="relative shrink-0">
                              <img
                                src={
                                  friend.avatar ||
                                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                                }
                                alt={friend.username}
                                className="w-12 h-12 rounded-full object-cover border border-slate-200"
                              />
                              {friend.isOnline && (
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                              )}
                            </Link>
                            <div className="min-w-0">
                              <Link
                                to={`/profile/${friend._id}`}
                                className="text-xs font-bold text-slate-900 hover:text-blue-600 truncate block"
                              >
                                {friend.username}
                              </Link>
                              <span className="text-[11px] text-slate-400 block truncate font-medium">
                                {friend.handle || `@${friend.username.toLowerCase()}`}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => navigate(`/messages?user=${friend._id}`)}
                              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                              title="Chat with friend"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Chat</span>
                            </button>
                            <Link
                              to={`/profile/${friend._id}`}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                            >
                              Profile
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── PHOTO LIGHTBOX MODAL ── */}
          {selectedPhoto &&
            createPortal(
              <div
                className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
                onClick={() => setSelectedPhoto(null)}
              >
                <div
                  className="bg-white rounded-3xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col md:flex-row shadow-2xl border border-slate-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Left: Image Container */}
                  <div className="md:w-3/5 bg-slate-950 flex items-center justify-center p-4 min-h-[300px] md:min-h-[500px]">
                    <img
                      src={selectedPhoto.image}
                      alt="Photo detail"
                      className="w-full h-auto max-h-[80vh] object-contain mx-auto"
                    />
                  </div>

                  {/* Right: Info & Stats */}
                  <div className="md:w-2/5 p-6 flex flex-col justify-between space-y-4 bg-white">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              selectedPhoto.user?.avatar ||
                              profileUser?.avatar ||
                              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                            }
                            alt="Author"
                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">
                              {selectedPhoto.user?.username || userDisplayName}
                            </h4>
                            <span className="text-[10px] text-slate-400">
                              {new Date(selectedPhoto.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedPhoto(null)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {selectedPhoto.text && (
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {selectedPhoto.text}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-bold">
                      <span className="flex items-center gap-1.5 text-rose-600">
                        <Heart className="w-4 h-4 fill-rose-500" />
                        {selectedPhoto.likes?.length || 0} Likes
                      </span>
                      <span className="flex items-center gap-1.5 text-blue-600">
                        <MessageCircle className="w-4 h-4" />
                        {selectedPhoto.comments?.length || 0} Comments
                      </span>
                    </div>
                  </div>
                </div>
              </div>,
              document.body
            )}

          {/* ── EDIT PROFILE MODAL PORTAL ── */}
          {showEditModal &&
            createPortal(
              <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-extrabold text-slate-900">
                        Edit Profile
                      </h3>
                    </div>
                    <button
                      onClick={() => {
                        setShowEditModal(false);
                        setAvatarPreview(null);
                        setCoverPreview(null);
                      }}
                      className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1.5">
                        Display Name *
                      </label>
                      <input
                        type="text"
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:bg-white focus:border-blue-600 text-slate-800 text-xs transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1.5">
                        Handle (@username)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. @john_doe"
                        value={editHandle}
                        onChange={(e) => setEditHandle(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:bg-white focus:border-blue-600 text-slate-800 text-xs transition-all font-medium"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1.5">
                        Bio Description
                      </label>
                      <textarea
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
                        rows={3}
                        placeholder="Tell the community about yourself..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-blue-600 text-slate-800 text-xs transition-all resize-none font-medium"
                      />
                    </div>

                    {/* Avatar Upload */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1.5">
                        Avatar Image
                      </label>
                      <div className="flex items-center gap-3">
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt="Avatar preview"
                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <img
                            src={
                              profileUser?.avatar ||
                              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                            }
                            alt="Avatar"
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 opacity-60"
                          />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          id="avatar-upload-input"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            setEditAvatar(file);
                            if (file) setAvatarPreview(URL.createObjectURL(file));
                          }}
                          className="hidden"
                        />
                        <label
                          htmlFor="avatar-upload-input"
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-colors border border-slate-200"
                        >
                          <Pencil className="w-3.5 h-3.5 text-blue-600" />
                          <span>Choose Avatar</span>
                        </label>
                      </div>
                    </div>

                    {/* Cover Upload */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1.5">
                        Cover Photo
                      </label>
                      <div className="flex items-center gap-3">
                        {coverPreview && (
                          <img
                            src={coverPreview}
                            alt="Cover preview"
                            className="w-14 h-9 rounded-lg object-cover border border-slate-200"
                          />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          id="cover-upload-input"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            setEditCover(file);
                            if (file) setCoverPreview(URL.createObjectURL(file));
                          }}
                          className="hidden"
                        />
                        <label
                          htmlFor="cover-upload-input"
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-colors border border-slate-200"
                        >
                          <Camera className="w-3.5 h-3.5 text-blue-600" />
                          <span>Choose Cover</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setShowEditModal(false);
                          setAvatarPreview(null);
                          setCoverPreview(null);
                        }}
                        className="px-4 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={savingProfile}
                        className="px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
                      >
                        {savingProfile && (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        )}
                        <span>Save Profile</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>,
              document.body
            )}
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
