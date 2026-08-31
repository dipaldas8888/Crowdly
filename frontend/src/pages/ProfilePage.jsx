import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
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
  Upload,
  X,
  Loader2,
  Film,
  Image as ImageIcon,
} from "lucide-react";

export default function ProfilePage() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();

  const profileUserId = !id || id === "me" ? currentUser?._id : id;
  const isOwnProfile = !id || id === "me" || id === currentUser?._id;

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

  const [activeTab, setActiveTab] = useState("photos"); // posts | photos | videos | likes
  const [posts, setPosts] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
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

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const res = await apiRequest(`/users/profile/${profileUserId || "me"}`);
      setProfileUser(res.user);
      setStats(res.stats || {});

      setEditUsername(res.user?.username || "");
      setEditHandle(res.user?.handle || "");
      setEditBio(res.user?.bio || "");
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTabContent = async (tab) => {
    try {
      setContentLoading(true);
      const targetId = profileUserId || "me";

      if (tab === "posts") {
        const data = await apiRequest(`/users/profile/${targetId}/posts`);
        setPosts(data || []);
      } else if (tab === "photos") {
        const data = await apiRequest(`/users/profile/${targetId}/photos`);
        setPhotos(data || []);
      } else if (tab === "videos") {
        const data = await apiRequest(`/users/profile/${targetId}/videos`);
        setVideos(data || []);
      } else if (tab === "likes") {
        const data = await apiRequest(`/users/profile/${targetId}/likes`);
        setLikedPosts(data || []);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setContentLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [id, currentUser]);

  useEffect(() => {
    if (profileUser) {
      fetchTabContent(activeTab);
    }
  }, [activeTab, profileUser]);

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
    } catch (err) {
      console.log(err);
    } finally {
      setSavingProfile(false);
    }
  };

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

  const userDisplayName = profileUser?.username || "John Doe";
  const userHandle = profileUser?.handle || `@${userDisplayName.toLowerCase().replace(/\s+/g, "")}`;
  const userBio = profileUser?.bio || "Look again at that dot. That's here. That's home. That's us. On it everyone you love, everyone you know, lived out their lives.";

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 antialiased flex flex-col">
      <Navbar />

      <div className="flex flex-1 w-full max-w-[1600px] mx-auto justify-between items-start">
        <LeftSidebar />

        <main className="flex-1 min-w-0 max-w-4xl mx-auto py-6 px-4 md:px-8 w-full space-y-6">
          {/* Top Full-Width Cover Banner Card */}
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

            {/* Overlapping Profile Avatar */}
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

              {/* Header Action Buttons (Message / Edit Profile) */}
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
                  <button className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4" />
                    <span>Message</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main Layout Grid: Left Profile Info Sidebar + Right Tab Feeds */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Column: User Info & Stats Box */}
            <div className="md:col-span-4 space-y-4">
              {/* User Bio & Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-xl font-bold text-slate-900">{userDisplayName}</h2>
                  <BadgeCheck className="w-5 h-5 text-blue-500 fill-blue-50" />
                </div>
                <p className="text-xs text-slate-400 font-medium">{userHandle}</p>
                <p className="text-xs text-slate-600 leading-relaxed pt-1">{userBio}</p>
              </div>

              {/* Stats Card Box */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs grid grid-cols-2 gap-4 text-left">
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    {stats.followersCount > 1000 ? `${(stats.followersCount / 1000).toFixed(1)}k` : stats.followersCount || 12}
                  </h4>
                  <span className="text-[11px] font-medium text-slate-400">Followers</span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">{stats.postsCount || 0}</h4>
                  <span className="text-[11px] font-medium text-slate-400">Posts</span>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <h4 className="text-base font-bold text-slate-900">{stats.groupsCount || 0}</h4>
                  <span className="text-[11px] font-medium text-slate-400">Collections</span>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <h4 className="text-base font-bold text-slate-900">
                    {stats.likesCount > 1000 ? `${(stats.likesCount / 1000).toFixed(1)}k` : stats.likesCount || 0}
                  </h4>
                  <span className="text-[11px] font-medium text-slate-400">Likes</span>
                </div>
              </div>

              {/* Joined Badges */}
              <div className="space-y-2 pt-1">
                <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-slate-200/60">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Joined {new Date(profileUser?.createdAt || Date.now()).toLocaleDateString(undefined, { month: "short", year: "numeric" })}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Tab Bar & Content Feeds */}
            <div className="md:col-span-8 space-y-5">
              {/* Tab Navigation Header Bar */}
              <div className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-xs flex items-center justify-between gap-1 overflow-x-auto">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveTab("posts")}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                      activeTab === "posts"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span>Posts</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      activeTab === "posts" ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-600"
                    }`}>
                      {stats.postsCount || 0}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab("photos")}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                      activeTab === "photos"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span>Photos</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      activeTab === "photos" ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-600"
                    }`}>
                      {stats.photosCount || 0}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab("videos")}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                      activeTab === "videos"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span>Videos</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      activeTab === "videos" ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-600"
                    }`}>
                      {stats.videosCount || 0}
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab("likes")}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                      activeTab === "likes"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span>Likes</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      activeTab === "likes" ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-600"
                    }`}>
                      {stats.likedPostsCount || 0}
                    </span>
                  </button>
                </div>
              </div>

              {/* Tab 1: Posts Feed */}
              {activeTab === "posts" && (
                <div className="space-y-5">
                  {isOwnProfile && <CreatePost setPosts={setPosts} />}

                  {contentLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="bg-white rounded-2xl h-44 animate-pulse border border-slate-200"></div>
                      ))}
                    </div>
                  ) : posts.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-400">
                      <p className="text-sm">No posts created yet.</p>
                    </div>
                  ) : (
                    posts.map((post) => (
                      <PostCard key={post._id} post={post} setPosts={setPosts} />
                    ))
                  )}
                </div>
              )}

              {/* Tab 2: Photos Grid (matching design screenshot) */}
              {activeTab === "photos" && (
                <div>
                  {contentLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white rounded-2xl h-64 animate-pulse border border-slate-200"></div>
                      ))}
                    </div>
                  ) : photos.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-400">
                      <ImageIcon className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="text-sm">No photos uploaded yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {photos.map((post) => (
                        <div
                          key={post._id}
                          className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden group hover:shadow-md transition-shadow"
                        >
                          <div className="h-64 bg-slate-200 relative overflow-hidden">
                            <img
                              src={post.image}
                              alt="Photo post"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>

                          <div className="p-3 flex items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <img
                                src={
                                  post.user?.avatar ||
                                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                                }
                                alt={post.user?.username}
                                className="w-6 h-6 rounded-full object-cover border border-slate-100 shrink-0"
                              />
                              <span className="font-semibold text-slate-800 truncate">
                                {post.user?.username || userDisplayName}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 text-slate-500 font-medium shrink-0">
                              <span className="flex items-center gap-1">
                                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-50" />
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

              {/* Tab 3: Videos Grid */}
              {activeTab === "videos" && (
                <div>
                  {contentLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="bg-white rounded-2xl h-56 animate-pulse border border-slate-200"></div>
                      ))}
                    </div>
                  ) : videos.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-400">
                      <Film className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="text-sm">No videos uploaded yet.</p>
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
                            className="w-full h-56 object-cover bg-black"
                          />
                          <div className="p-3 text-xs">
                            <p className="text-slate-700 font-medium truncate">{post.text || "Video Post"}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Likes Feed */}
              {activeTab === "likes" && (
                <div className="space-y-5">
                  {contentLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="bg-white rounded-2xl h-44 animate-pulse border border-slate-200"></div>
                      ))}
                    </div>
                  ) : likedPosts.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-400">
                      <p className="text-sm">No liked posts yet.</p>
                    </div>
                  ) : (
                    likedPosts.map((post) => (
                      <PostCard key={post._id} post={post} setPosts={setLikedPosts} />
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Edit Profile Modal */}
          {showEditModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">Edit Profile</h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Display Name</label>
                    <input
                      type="text"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Handle (@username)</label>
                    <input
                      type="text"
                      placeholder="e.g. @john_doe"
                      value={editHandle}
                      onChange={(e) => setEditHandle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Bio Description</label>
                    <textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Avatar Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setEditAvatar(e.target.files[0])}
                      className="w-full text-xs text-slate-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Cover Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setEditCover(e.target.files[0])}
                      className="w-full text-xs text-slate-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {savingProfile && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
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
