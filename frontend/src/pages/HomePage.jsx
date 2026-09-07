import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";
import Navbar from "../components/Navbar";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import Stories from "../components/Stories";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPosts = async (pageNum = 1) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const res = await apiRequest(`/posts?page=${pageNum}&limit=5`);

      // Support paginated object or fallback array
      const newPosts = res.posts || (Array.isArray(res) ? res : []);
      const more = res.hasMore !== undefined ? res.hasMore : false;

      if (pageNum === 1) {
        setPosts(newPosts);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
      }

      setHasMore(more);
      setPage(pageNum);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPosts(1);
  }, []);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchPosts(page + 1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 antialiased flex flex-col">
      {/* Top Navigation Bar */}
      <Navbar />

      {/* Main Full-Width Flex Layout */}
      <div className="flex flex-1 w-full max-w-[1600px] mx-auto justify-between items-start">
        {/* Left Sidebar (Flush Left) */}
        <LeftSidebar />

        {/* Center Main Content Feed */}
        <main className="flex-1 min-w-0 max-w-3xl xl:max-w-4xl mx-auto py-4 sm:py-6 px-3 sm:px-4 md:px-8 w-full pb-16 md:pb-6">
          {/* Top Stories Row */}
          <Stories />

          {/* Create Post Box */}
          <CreatePost setPosts={setPosts} />

          {/* Posts Feed */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6 h-48 animate-pulse border border-slate-200/80"
                ></div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80 text-slate-400 shadow-xs">
              <p className="text-sm font-medium">
                No posts yet. Share something with the community!
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} setPosts={setPosts} />
              ))}

              {/* Load More Pagination Control */}
              {hasMore && (
                <div className="text-center pt-2 pb-6">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        <span>Loading more posts...</span>
                      </>
                    ) : (
                      <span>Load More Posts</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Right Sidebar (Flush Right) */}
        <RightSidebar />
      </div>
    </div>
  );
}
