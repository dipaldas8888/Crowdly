import { useEffect, useState, useCallback } from "react";
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
  LayoutGrid,
  FileText,
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

  // Default to "posts" tab so posts load immediately
  const [activeTab, setActiveTab] = useState("posts");
  const [posts, setPosts] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);

  // Edit Profile modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editHandle, setEditHandle] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatar, setEditAvatar] = useState(null);
  const [editCover, setEditCover] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // Fetch profile info + stats
  const fetchProfileData = useCallback(async () => {
    if (!profileUserId) return; // Wait until we have an ID
    try {
      setLoading(true);
      const res = await apiRequest(`/users/profile/${profileUserId}`);
      setProfileUser(res.user);
      setStats(res.stats || {});
      setEditUsername(res.user?.username || "");
      setEditHandle(res.user?.handle || "");
      setEditBio(res.user?.bio || "");
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  }, [profileUserId]);

  // Fetch content for a specific tab
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
      }
    } catch (err) {
      console.error(`Error fetching ${tab}:`, err);
    } finally {
      setContentLoading(false);
    }
  }, [profileUserId]);

  // Fetch profile once we know who we're looking at
  useEffect(() => {
    if (profileUserId) {
      fetchProfileData();
    }
  }, [fetchProfileData, profileUserId]);

  // Fetch tab content when tab changes or profile loads
  useEffect(() => {
    if (profileUser && profileUserId) {
      fetchTabContent(activeTab);
    }
  }, [activeTab, profileUser, fetchTabContent]);

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
      toast.success("Profile updated successfully!");
      // Refresh stats too
      fetchProfileData();
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  // Callback passed to CreatePost: prepends new post and increments postsCount
  const handlePostCreated = useCallback((newPost) => {
    setPosts((prev) => [newPost, ...prev]);
    setStats((prev) => ({ ...prev, postsCount: (prev.postsCount || 0) + 1 }));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  const userDisplayName = profileUser?.username || "User";
  const userHandle =
    profileUser?.handle ||
    `@${userDisplayName.toLowerCase().replace(/\s+/g, "")}`;
  const userBio =
    profileUser?.bio ||
    "No bio added yet.";

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 antialiased flex flex-col">
      <Navbar />

      <div className="flex flex-1 w-full max-w-[1600px] mx-auto justify-between items-start">
        <LeftSidebar />

        <main className="flex-1 min-w-0 max-w-4xl mx-auto py-6 px-4 md:px-8 w-full space-y-6">
          {/* Cover Banner Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden relative">
            <div className="h-56 md:h-72 bg-slate-200 relative overflow-hidden">
              <img
                src={
                  profileUser?.coverImage ||
                  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80"
                }
                alt="Cover"
                className="w-full h-full object-cover"
              />
              {isOwnProfile && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Edit Cover</span>
                </button>
              )}
            </div>

            {/* Avatar overlapping cover */}
            <div className="-mt-14 md:-mt-18 ml-6 md:ml-10 relative z-10 flex items-end justify-between pr-6 mb-4">
              <div className="relative group">
                <img
                  src={
                    profileUser?.avatar ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
                  }
                  alt={userDisplayName}
                  className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-white shadow-md object-cover bg-white"
                />
                {isOwnProfile && (
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="absolute bottom-1 right-1 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md transition-colors cursor-pointer"
                    title="Change Avatar"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer border border-slate-200">
                  <Bookmark className="w-4 h-4" />
                </button>
                {isOwnProfile ? (
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(`/messages?user=${profileUser?._id}`)}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Message</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main grid: left bio + right tabs */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left: Bio & Stats */}
            <div className="md:col-span-4 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl md:text-2xl font-extrabold text-slate-900">
                    {userDisplayName}
                  </h2>
                  <BadgeCheck className="w-5 h-5 text-blue-500 fill-blue-50" />
                </div>
                <p className="text-xs text-slate-500 font-semibold">{userHandle}</p>
                <p className="text-sm text-slate-700 leading-relaxed pt-1">{userBio}</p>
              </div>

              {/* Stats grid */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs grid grid-cols-2 gap-4 text-left">
                <div>
                  <h4 className="text-lg font-black text-slate-900">
                    {stats.followersCount > 1000
                      ? `${(stats.followersCount / 1000).toFixed(1)}k`
                      : stats.followersCount || 0}
                  </h4>
                  <span className="text-xs font-semibold text-slate-500">Followers</span>
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900">
                    {stats.postsCount || 0}
                  </h4>
                  <span className="text-xs font-semibold text-slate-500">Posts</span>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <h4 className="text-lg font-black text-slate-900">
                    {stats.photosCount || 0}
                  </h4>
                  <span className="text-xs font-semibold text-slate-500">Photos</span>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <h4 className="text-lg font-black text-slate-900">
                    {stats.videosCount || 0}
                  </h4>
                  <span className="text-xs font-semibold text-slate-500">Videos</span>
                </div>
              </div>

              {/* Joined badge */}
              <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl border border-slate-200/60">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>
                  Joined{" "}
                  {new Date(
                    profileUser?.createdAt || Date.now()
                  ).toLocaleDateString(undefined, {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Right: Tabs + Content */}
            <div className="md:col-span-8 space-y-4">
              {/* Tab bar */}
              <div className="bg-white rounded-2xl p-1.5 border border-slate-200/80 shadow-xs flex items-center gap-1 overflow-x-auto">
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
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? "bg-blue-600 text-white shadow-xs"
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
                        // Support both functional updater and direct post object
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
                    <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 text-slate-400">
                      <FileText className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                      <p className="text-sm font-semibold">No posts yet.</p>
                      {isOwnProfile && (
                        <p className="text-xs text-slate-400 mt-1">
                          Share your first post above!
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
                    <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 text-slate-400">
                      <ImageIcon className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                      <p className="text-sm font-semibold">No photos yet.</p>
                      {isOwnProfile && (
                        <p className="text-xs text-slate-400 mt-1">
                          Post something with an image to see it here.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {photos.map((post) => (
                        <div
                          key={post._id}
                          className="bg-slate-200 rounded-2xl overflow-hidden group relative cursor-pointer hover:shadow-md transition-shadow"
                          style={{ aspectRatio: "1 / 1" }}
                        >
                          <img
                            src={post.image}
                            alt="Photo"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {/* Overlay on hover */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-end">
                            <div className="p-2 w-full opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="flex items-center gap-3 text-white text-xs font-semibold">
                                <span className="flex items-center gap-1">
                                  <Heart className="w-3.5 h-3.5" />
                                  {post.likes?.length || 0}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  {post.comments?.length || 0}
                                </span>
                              </div>
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
                    <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 text-slate-400">
                      <Film className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                      <p className="text-sm font-semibold">No videos yet.</p>
                      {isOwnProfile && (
                        <p className="text-xs text-slate-400 mt-1">
                          Upload a video from the Watch page to see it here.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {videos.map((post) => (
                        <div
                          key={post._id}
                          className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden"
                        >
                          <video
                            src={post.video}
                            controls
                            className="w-full h-52 object-cover bg-black"
                          />
                          <div className="p-3">
                            <p className="text-xs text-slate-700 font-medium truncate">
                              {post.text || "Video"}
                            </p>
                            <div className="flex items-center gap-3 mt-1.5 text-slate-400">
                              <span className="flex items-center gap-1 text-xs">
                                <Heart className="w-3.5 h-3.5" />
                                {post.likes?.length || 0}
                              </span>
                              <span className="flex items-center gap-1 text-xs">
                                <MessageCircle className="w-3.5 h-3.5" />
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
            </div>
          </div>

          {/* Edit Profile Modal */}
          {showEditModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-lg font-bold text-slate-900">Edit Profile</h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1.5">
                      Display Name *
                    </label>
                    <input
                      type="text"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:bg-white focus:border-blue-600 text-slate-800 text-xs transition-all"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1.5">
                      Handle (@username)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. @john_doe"
                      value={editHandle}
                      onChange={(e) => setEditHandle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:bg-white focus:border-blue-600 text-slate-800 text-xs transition-all"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1.5">
                      Bio Description
                    </label>
                    <textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      rows={3}
                      placeholder="Tell the community about yourself..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:bg-white focus:border-blue-600 text-slate-800 text-xs transition-all resize-none"
                    />
                  </div>

                  {/* Avatar Upload */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1.5">
                      Avatar Image
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        id="avatar-upload-input"
                        onChange={(e) => setEditAvatar(e.target.files[0])}
                        className="hidden"
                      />
                      <label
                        htmlFor="avatar-upload-input"
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-colors border border-slate-200"
                      >
                        <Pencil className="w-3.5 h-3.5 text-blue-600" />
                        <span>Choose Avatar</span>
                      </label>
                      <span className="text-xs text-slate-500 truncate max-w-[160px]">
                        {editAvatar ? editAvatar.name : "No file chosen"}
                      </span>
                    </div>
                  </div>

                  {/* Cover Upload */}
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1.5">
                      Cover Image
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        id="cover-upload-input"
                        onChange={(e) => setEditCover(e.target.files[0])}
                        className="hidden"
                      />
                      <label
                        htmlFor="cover-upload-input"
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-colors border border-slate-200"
                      >
                        <Camera className="w-3.5 h-3.5 text-blue-600" />
                        <span>Choose Cover</span>
                      </label>
                      <span className="text-xs text-slate-500 truncate max-w-[160px]">
                        {editCover ? editCover.name : "No file chosen"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="px-5 py-2.5 bg-blue-600 text-white font-semibold text-xs rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      {savingProfile && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      )}
                      <span>Save Profile</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
