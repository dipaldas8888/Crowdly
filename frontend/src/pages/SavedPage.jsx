import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import MobileNav from "../components/MobileNav";
import PostCard from "../components/PostCard";
import PageLoader from "../components/PageLoader";
import { apiRequest } from "../lib/api";
import { Bookmark, Search, ArrowLeft, Sparkles } from "lucide-react";

export default function SavedPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        setLoading(true);
        const data = await apiRequest("/posts/saved");
        setPosts(data.posts || []);
      } catch (err) {
        console.error("Failed to load saved posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedPosts();
  }, []);

  const filteredPosts = posts.filter((post) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    const textMatch = post.text?.toLowerCase().includes(query);
    const authorMatch = post.user?.username?.toLowerCase().includes(query);
    const locationMatch = post.location?.toLowerCase().includes(query);
    return textMatch || authorMatch || locationMatch;
  });

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 antialiased flex flex-col">
      <Navbar />

      <div className="flex flex-1 w-full max-w-[1600px] mx-auto justify-between items-start">
        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Center Main Content Area */}
        <main className="flex-1 min-w-0 max-w-3xl xl:max-w-4xl mx-auto py-4 sm:py-6 px-3 sm:px-4 md:px-8 w-full pb-16 md:pb-6">
          {/* Header Banner */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 mb-5 shadow-xs">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center shrink-0">
                  <Bookmark className="w-6 h-6 text-amber-600 fill-amber-500/20" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 leading-tight">
                    Saved Posts
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">
                    {posts.length} {posts.length === 1 ? "post" : "posts"} saved in your collection
                  </p>
                </div>
              </div>

              <Link
                to="/home"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Feed
              </Link>
            </div>

            {/* Search Input Bar */}
            {posts.length > 0 && (
              <div className="mt-4 flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 focus-within:border-amber-500 focus-within:bg-white focus-within:ring-1 focus-within:ring-amber-500/30 transition-all">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search saved posts by text, author, or location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full text-xs bg-transparent outline-none text-slate-800 placeholder:text-slate-400 font-medium"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="text-xs font-semibold text-slate-400 hover:text-slate-600"
                  >
                    Clear
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="py-12 flex justify-center">
              <PageLoader />
            </div>
          ) : filteredPosts.length > 0 ? (
            /* Saved Posts List */
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <PostCard key={post._id} post={post} setPosts={setPosts} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-12 text-center shadow-xs">
              <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-4">
                <Bookmark className="w-8 h-8 text-amber-500 fill-amber-500/20" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">
                {search ? "No matching saved posts found" : "No saved posts yet"}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
                {search
                  ? `No saved items matched "${search}". Try searching for something else.`
                  : "Click the bookmark icon on any post in your feed to save it here for quick access anytime!"}
              </p>
              {search ? (
                <button
                  onClick={() => setSearch("")}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Reset Search
                </button>
              ) : (
                <Link
                  to="/home"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  <Sparkles className="w-4 h-4" /> Explore Feed
                </Link>
              )}
            </div>
          )}
        </main>

        {/* Right Sidebar */}
        <RightSidebar />
      </div>

      <MobileNav />
    </div>
  );
}
