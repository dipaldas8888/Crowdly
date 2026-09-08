import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../lib/api";
import { Plus, X, Upload, ChevronLeft, ChevronRight, Eye, Trash2, Loader2, Play, Pause, Image as ImageIcon } from "lucide-react";
import { toast } from "react-toastify";

export default function Stories() {
  const { user } = useAuth();
  const [groupedStories, setGroupedStories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [mediaType, setMediaType] = useState("image");
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);

  // Viewer state
  const [activeViewerUserIndex, setActiveViewerUserIndex] = useState(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch stories on mount
  const fetchStories = async () => {
    try {
      setLoading(true);
      const res = await apiRequest("/stories");
      if (res?.grouped) {
        setGroupedStories(res.grouped);
      }
    } catch (err) {
      console.error("Error fetching stories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  // Handle file select for new story
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    if (!file.type.startsWith("image/") && !isVideo) {
      toast.error("Please upload an image or video file");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toast.error("File size must be under 25MB");
      return;
    }

    setSelectedFile(file);
    setMediaType(isVideo ? "video" : "image");
    setFilePreview(URL.createObjectURL(file));
  };

  // Submit new story
  const handleCreateStory = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select a photo or video");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("media", selectedFile);
      formData.append("caption", caption);

      await apiRequest("/stories", {
        method: "POST",
        body: formData,
      });

      toast.success("Story posted successfully!");
      setShowAddModal(false);
      setSelectedFile(null);
      setFilePreview(null);
      setCaption("");
      fetchStories();
    } catch (err) {
      toast.error(err.message || "Failed to post story");
    } finally {
      setUploading(false);
    }
  };

  // Open Viewer for a user's stories
  const openStoryViewer = (userIndex) => {
    setActiveViewerUserIndex(userIndex);
    setActiveStoryIndex(0);
    setProgress(0);
    setIsPaused(false);
    markCurrentAsViewed(userIndex, 0);
  };

  const markCurrentAsViewed = async (uIdx, sIdx) => {
    const group = groupedStories[uIdx];
    if (!group) return;
    const story = group.stories[sIdx];
    if (!story) return;

    try {
      await apiRequest(`/stories/${story._id}/view`, { method: "POST" });
    } catch (err) {
      console.error(err);
    }
  };

  const closeViewer = () => {
    setActiveViewerUserIndex(null);
    setActiveStoryIndex(0);
    setProgress(0);
    clearInterval(timerRef.current);
    fetchStories();
  };

  // Auto progress story viewer
  useEffect(() => {
    if (activeViewerUserIndex === null) return;

    const group = groupedStories[activeViewerUserIndex];
    if (!group) return;
    const currentStory = group.stories[activeStoryIndex];
    if (!currentStory) return;

    if (isPaused) {
      clearInterval(timerRef.current);
      return;
    }

    // 5 second timer for images
    const duration = 5000;
    const intervalTime = 50;
    const increment = (intervalTime / duration) * 100;

    setProgress(0);

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNextStory();
          return 0;
        }
        return prev + increment;
      });
    }, intervalTime);

    return () => clearInterval(timerRef.current);
  }, [activeViewerUserIndex, activeStoryIndex, isPaused, groupedStories]);

  const handleNextStory = () => {
    if (activeViewerUserIndex === null) return;
    const group = groupedStories[activeViewerUserIndex];
    if (!group) return;

    if (activeStoryIndex < group.stories.length - 1) {
      const nextSIdx = activeStoryIndex + 1;
      setActiveStoryIndex(nextSIdx);
      setProgress(0);
      markCurrentAsViewed(activeViewerUserIndex, nextSIdx);
    } else if (activeViewerUserIndex < groupedStories.length - 1) {
      const nextUIdx = activeViewerUserIndex + 1;
      setActiveViewerUserIndex(nextUIdx);
      setActiveStoryIndex(0);
      setProgress(0);
      markCurrentAsViewed(nextUIdx, 0);
    } else {
      closeViewer();
    }
  };

  const handlePrevStory = () => {
    if (activeViewerUserIndex === null) return;

    if (activeStoryIndex > 0) {
      setActiveStoryIndex((prev) => prev - 1);
      setProgress(0);
    } else if (activeViewerUserIndex > 0) {
      const prevUIdx = activeViewerUserIndex - 1;
      const prevGroup = groupedStories[prevUIdx];
      setActiveViewerUserIndex(prevUIdx);
      setActiveStoryIndex(prevGroup.stories.length - 1);
      setProgress(0);
    }
  };

  const handleDeleteStory = async (storyId) => {
    try {
      await apiRequest(`/stories/${storyId}`, { method: "DELETE" });
      toast.success("Story deleted");
      closeViewer();
      fetchStories();
    } catch (err) {
      toast.error(err.message || "Failed to delete story");
    }
  };

  // Find user's existing story group if any
  const currentUserGroupIndex = groupedStories.findIndex(
    (g) => g.user?._id?.toString() === (user?._id || user)?.toString()
  );

  return (
    <div className="mb-6">
      {/* Story Carousel Bar */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {/* Create Story Card */}
        <div
          onClick={() => setShowAddModal(true)}
          className="relative shrink-0 w-28 sm:w-32 h-44 sm:h-52 rounded-2xl overflow-hidden cursor-pointer group shadow-xs hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 bg-white border border-slate-200/80"
        >
          <div className="h-3/4 relative overflow-hidden bg-slate-100">
            <img
              src={
                user?.avatar ||
                "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80"
              }
              alt="Create Story"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/0 transition-colors" />
          </div>
          <div className="h-1/4 bg-white relative flex flex-col items-center justify-end pb-2.5 px-1">
            <div className="absolute -top-4 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center border-2 border-white shadow-md group-hover:scale-110 transition-transform">
              <Plus className="w-4 h-4 stroke-[3]" />
            </div>
            <span className="text-xs font-bold text-slate-800 truncate max-w-full">
              Add Story
            </span>
          </div>
        </div>

        {/* Existing Story Cards */}
        {groupedStories.map((group, uIdx) => {
          const isCurrentUser = group.user?._id?.toString() === (user?._id || user)?.toString();
          const firstStory = group.stories[0];
          if (!firstStory) return null;

          return (
            <div
              key={group.user._id}
              onClick={() => openStoryViewer(uIdx)}
              className={`
                relative shrink-0 w-28 sm:w-32 h-44 sm:h-52 rounded-2xl overflow-hidden cursor-pointer group shadow-xs hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1
                ring-2 ${
                  group.hasUnseen
                    ? "ring-pink-500 ring-offset-2 ring-offset-slate-50"
                    : "ring-slate-300"
                }
              `}
            >
              {/* Thumbnail / Media */}
              {firstStory.mediaType === "video" ? (
                <video
                  src={firstStory.mediaUrl}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <img
                  src={firstStory.mediaUrl}
                  alt={group.user.username}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* User Avatar Badge */}
              <div className="absolute top-2.5 left-2.5">
                <img
                  src={
                    group.user.avatar ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                  }
                  alt={group.user.username}
                  className={`w-8 h-8 rounded-full object-cover border-2 ${
                    group.hasUnseen ? "border-pink-500" : "border-white"
                  }`}
                />
              </div>

              {/* User Name */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5">
                <span className="text-xs font-bold text-white truncate block drop-shadow-md">
                  {isCurrentUser ? "Your Story" : group.user.username}
                </span>
                {group.stories.length > 1 && (
                  <span className="text-[10px] text-slate-200 opacity-90 block">
                    {group.stories.length} updates
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* --- ADD STORY MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-100 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setShowAddModal(false);
                setSelectedFile(null);
                setFilePreview(null);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              Create a Story
            </h3>

            <form onSubmit={handleCreateStory} className="space-y-4">
              {/* Media Picker / Preview */}
              {!filePreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/70 hover:bg-blue-50/40 group"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-xs">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">
                    Click to upload photo or video
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Supports JPG, PNG, MP4 (Max 25MB)
                  </p>
                </div>
              ) : (
                <div className="relative h-64 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center group shadow-inner">
                  {mediaType === "video" ? (
                    <video src={filePreview} controls className="max-h-full max-w-full object-contain" />
                  ) : (
                    <img src={filePreview} alt="Preview" className="max-h-full max-w-full object-contain" />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setFilePreview(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Caption Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Caption (optional)
                </label>
                <input
                  type="text"
                  placeholder="Add a caption..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedFile(null);
                    setFilePreview(null);
                  }}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center gap-2"
                >
                  {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {uploading ? "Posting..." : "Share to Story"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- FULLSCREEN STORY VIEWER MODAL --- */}
      {activeViewerUserIndex !== null && (() => {
        const group = groupedStories[activeViewerUserIndex];
        if (!group) return null;
        const currentStory = group.stories[activeStoryIndex];
        if (!currentStory) return null;
        const isOwner = group.user?._id?.toString() === (user?._id || user)?.toString();

        return (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none">
            {/* Background container */}
            <div className="relative w-full max-w-sm sm:max-w-md h-[85vh] bg-slate-950 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between">
              
              {/* Progress Bars at Top */}
              <div className="absolute top-3 left-3 right-3 z-30 flex gap-1.5">
                {group.stories.map((s, idx) => (
                  <div key={s._id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-75"
                      style={{
                        width:
                          idx < activeStoryIndex
                            ? "100%"
                            : idx === activeStoryIndex
                            ? `${progress}%`
                            : "0%",
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Story Header */}
              <div className="absolute top-6 left-3 right-3 z-30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={
                      group.user.avatar ||
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                    }
                    alt={group.user.username}
                    className="w-9 h-9 rounded-full object-cover border-2 border-white/80"
                  />
                  <div>
                    <span className="text-sm font-bold text-white block drop-shadow-sm">
                      {group.user.username}
                    </span>
                    <span className="text-[10px] text-white/70 block">
                      {new Date(currentStory.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPaused((prev) => !prev)}
                    className="p-1.5 rounded-full bg-black/40 text-white hover:bg-black/70 transition-colors"
                  >
                    {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  </button>
                  {isOwner && (
                    <button
                      onClick={() => handleDeleteStory(currentStory._id)}
                      title="Delete Story"
                      className="p-1.5 rounded-full bg-black/40 text-rose-400 hover:bg-rose-600 hover:text-white transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={closeViewer}
                    className="p-1.5 rounded-full bg-black/40 text-white hover:bg-black/70 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Media Content */}
              <div className="relative flex-1 bg-black flex items-center justify-center">
                {currentStory.mediaType === "video" ? (
                  <video
                    ref={videoRef}
                    src={currentStory.mediaUrl}
                    autoPlay
                    playsInline
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <img
                    src={currentStory.mediaUrl}
                    alt="Story"
                    className="max-h-full max-w-full object-contain"
                  />
                )}

                {/* Left / Right Nav Click Hotspots */}
                <div
                  onClick={handlePrevStory}
                  className="absolute left-0 top-16 bottom-16 w-1/3 z-20 cursor-pointer flex items-center justify-start pl-2 opacity-0 hover:opacity-100 transition-opacity"
                >
                  <div className="p-2 rounded-full bg-black/50 text-white">
                    <ChevronLeft className="w-6 h-6" />
                  </div>
                </div>

                <div
                  onClick={handleNextStory}
                  className="absolute right-0 top-16 bottom-16 w-1/3 z-20 cursor-pointer flex items-center justify-end pr-2 opacity-0 hover:opacity-100 transition-opacity"
                >
                  <div className="p-2 rounded-full bg-black/50 text-white">
                    <ChevronRight className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Story Footer / Caption / View Counter */}
              <div className="absolute bottom-4 left-3 right-3 z-30 space-y-2">
                {currentStory.caption && (
                  <div className="bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-xl text-center">
                    <p className="text-sm font-medium text-white drop-shadow-sm">
                      {currentStory.caption}
                    </p>
                  </div>
                )}

                {isOwner && (
                  <div className="flex items-center justify-center gap-1.5 text-white/80 text-xs font-semibold bg-black/40 backdrop-blur-xs py-1 px-3 rounded-full w-fit mx-auto">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{currentStory.views?.length || 1} views</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
