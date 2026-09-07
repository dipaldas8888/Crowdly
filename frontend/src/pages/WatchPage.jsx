import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import { apiRequest } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import {
  Tv,
  Plus,
  Search,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Loader2,
  X,
  Upload,
  Send,
  Play,
} from "lucide-react";

export default function WatchPage() {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Entertainment");
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Comment Drawer state per video
  const [activeCommentVideoId, setActiveCommentVideoId] = useState(null);
  const [commentText, setCommentText] = useState("");

  const categories = [
    "All",
    "Gaming",
    "Tutorials",
    "Entertainment",
    "Music",
    "Tech",
    "News",
  ];

  const fetchVideos = async () => {
    try {
      setLoading(true);
      let url = "/watch?";
      if (selectedCategory !== "All") url += `category=${selectedCategory}&`;
      if (search.trim()) url += `search=${encodeURIComponent(search)}`;

      const data = await apiRequest(url);
      setVideos(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [selectedCategory, search]);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !videoFile) return;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("video", videoFile);

    try {
      setUploading(true);
      setUploadError("");

      const newVid = await apiRequest("/watch", {
        method: "POST",
        body: formData,
      });

      setVideos((prev) => [newVid, ...prev]);
      toast.success("Video uploaded successfully!");
      setShowUploadModal(false);
      setTitle("");
      setDescription("");
      setVideoFile(null);
    } catch (err) {
      setUploadError(err.message);
      toast.error(err.message || "Failed to upload video");
    } finally {
      setUploading(false);
    }
  };

  const handleLike = async (videoId) => {
    setVideos((prev) =>
      prev.map((v) =>
        v._id === videoId
          ? {
              ...v,
              likes: v.likes?.some((u) => (u._id || u) === user?._id)
                ? v.likes.filter((u) => (u._id || u) !== user?._id)
                : [...(v.likes || []), user],
            }
          : v,
      ),
    );

    try {
      const updatedVideo = await apiRequest(`/watch/like/${videoId}`, {
        method: "PUT",
      });
      setVideos((prev) => prev.map((v) => (v._id === videoId ? updatedVideo : v)));
    } catch (err) {
      console.log(err);
    }
  };

  const handleComment = async (videoId) => {
    if (!commentText.trim()) return;

    try {
      const updatedVideo = await apiRequest(`/watch/comment/${videoId}`, {
        method: "POST",
        body: { text: commentText },
      });

      setVideos((prev) => prev.map((v) => (v._id === videoId ? updatedVideo : v)));
      setCommentText("");
    } catch (err) {
      console.log(err);
    }
  };

  const handleShare = async (videoId) => {
    try {
      await apiRequest(`/watch/share/${videoId}`, { method: "POST" });
      setVideos((prev) =>
        prev.map((v) =>
          v._id === videoId ? { ...v, sharesCount: (v.sharesCount || 0) + 1 } : v,
        ),
      );
      navigator.clipboard?.writeText(window.location.href);
      toast.success("Video link copied to clipboard!");
    } catch (err) {
      console.log(err);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "Recently";
    return new Date(dateString).toLocaleDateString();
  };

  /**
   * Converts a Cloudinary VIDEO url to a JPEG thumbnail url.
   * Works by replacing /video/upload/ with /video/upload/so_0,f_jpg/
   * and swapping the extension to .jpg
   * Falls back to null if not a Cloudinary URL (browser will skip the poster).
   */
  const getVideoThumbnail = (videoUrl) => {
    if (!videoUrl || !videoUrl.includes("cloudinary.com")) return null;
    // Insert transformation: snapshot at 0s, format jpg
    return videoUrl
      .replace("/video/upload/", "/video/upload/so_0,f_jpg/")
      .replace(/\.(mp4|mov|webm|avi|mkv)(\?.*)?$/, ".jpg");
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 antialiased flex flex-col">
      <Navbar />

      <div className="flex flex-1 w-full max-w-[1600px] mx-auto justify-between items-start">
        <LeftSidebar />

        {/* Center Content: Watch Platform */}
        <main className="flex-1 min-w-0 max-w-3xl xl:max-w-4xl mx-auto py-4 sm:py-6 px-3 sm:px-4 md:px-8 w-full space-y-4 sm:space-y-6 pb-16 md:pb-12">
          {/* Header Action Bar */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Tv className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Crowdly Watch</h1>
                <p className="text-xs text-slate-500">Discover & share trending videos</p>
              </div>
            </div>

            {/* Search Input & Upload Button */}
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-100 border border-transparent rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-purple-500 outline-none"
                />
              </div>

              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Video</span>
              </button>
            </div>
          </div>

          {/* Category Chips Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-purple-600 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Video Cards Feed */}
          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : videos.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-slate-200/80 text-center space-y-3">
              <Tv className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-700">No videos found</h3>
              <p className="text-xs text-slate-400">
                Be the first to upload a video in this category!
              </p>
            </div>
          ) : (
            videos.map((vid) => {
              const isLiked = vid.likes?.some((u) => (u._id || u) === user?._id);
              const showComments = activeCommentVideoId === vid._id;

              return (
                <div
                  key={vid._id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-shadow hover:shadow-sm"
                >
                  {/* Video Player Box */}
                  <div className="relative bg-black aspect-video">
                    <video
                      src={vid.videoUrl}
                      controls
                      poster={getVideoThumbnail(vid.videoUrl) || vid.thumbnailUrl || undefined}
                      className="w-full h-full object-contain"
                      preload="metadata"
                    />
                  </div>

                  {/* Video Meta Info */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="inline-block bg-purple-50 text-purple-600 font-semibold text-[11px] px-2.5 py-0.5 rounded-full mb-1.5">
                          {vid.category || "Entertainment"}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 leading-snug">
                          {vid.title}
                        </h3>
                        {vid.description && (
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {vid.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Author & Views Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            vid.user?.avatar ||
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                          }
                          alt={vid.user?.username}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">
                            {vid.user?.username || "Crowdly Creator"}
                          </h4>
                          <span className="text-[10px] text-slate-400">
                            {formatTime(vid.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                        <Eye className="w-4 h-4 text-slate-400" />
                        <span>{vid.viewsCount || 0} views</span>
                      </div>
                    </div>

                    {/* Interactive Action Bar */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-medium text-slate-600">
                      <div className="flex items-center gap-6">
                        <button
                          onClick={() => handleLike(vid._id)}
                          className={`flex items-center gap-1.5 hover:text-rose-500 transition-colors cursor-pointer ${
                            isLiked ? "text-rose-500 font-bold" : ""
                          }`}
                        >
                          <Heart
                            className={`w-4.5 h-4.5 ${
                              isLiked ? "fill-rose-500 stroke-rose-500" : ""
                            }`}
                          />
                          <span>{vid.likes?.length || 0} Likes</span>
                        </button>

                        <button
                          onClick={() =>
                            setActiveCommentVideoId(showComments ? null : vid._id)
                          }
                          className="flex items-center gap-1.5 hover:text-purple-600 transition-colors cursor-pointer"
                        >
                          <MessageCircle className="w-4.5 h-4.5" />
                          <span>{vid.comments?.length || 0} Comments</span>
                        </button>
                      </div>

                      <button
                        onClick={() => handleShare(vid._id)}
                        className="flex items-center gap-1.5 hover:text-slate-900 transition-colors cursor-pointer"
                      >
                        <Share2 className="w-4.5 h-4.5 text-slate-400" />
                        <span>{vid.sharesCount || 0} Shares</span>
                      </button>
                    </div>

                    {/* Comments Drawer */}
                    {showComments && (
                      <div className="pt-3 border-t border-slate-100 space-y-3">
                        {vid.comments && vid.comments.length > 0 && (
                          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                            {vid.comments.map((c, i) => (
                              <div
                                key={i}
                                className="flex items-start gap-2 bg-slate-50 p-2 rounded-xl text-xs"
                              >
                                <img
                                  src={
                                    c.user?.avatar ||
                                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                                  }
                                  alt={c.user?.username}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                                <div>
                                  <span className="font-bold text-slate-800 block text-[11px]">
                                    {c.user?.username}
                                  </span>
                                  <span className="text-slate-700">{c.text}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Add a comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleComment(vid._id);
                              }
                            }}
                            className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:bg-white outline-none"
                          />
                          <button
                            onClick={() => handleComment(vid._id)}
                            disabled={!commentText.trim()}
                            className="p-1.5 bg-purple-600 text-white rounded-xl disabled:opacity-40"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </main>

        <RightSidebar />
      </div>

      {/* Upload Video Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 relative">
            <button
              onClick={() => setShowUploadModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-bold text-slate-900">Upload Video to Crowdly Watch</h3>
              <p className="text-xs text-slate-500">Share your video content with the community.</p>
            </div>

            {uploadError && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs font-medium rounded-xl border border-rose-200">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Video Title *</label>
                <input
                  type="text"
                  placeholder="e.g. My Amazing Travel Vlog 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-purple-600"
                >
                  {categories.filter((c) => c !== "All").map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Tell viewers about your video..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Video File *</label>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 cursor-pointer">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files[0])}
                    required
                    className="hidden"
                    id="video-file-input"
                  />
                  <label htmlFor="video-file-input" className="cursor-pointer space-y-2 block">
                    <Upload className="w-8 h-8 text-purple-600 mx-auto" />
                    <span className="text-xs font-semibold text-slate-700 block">
                      {videoFile ? videoFile.name : "Click to select a video file"}
                    </span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={uploading || !title.trim() || !videoFile}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md shadow-purple-600/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{uploading ? "Uploading Video..." : "Publish Video"}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
