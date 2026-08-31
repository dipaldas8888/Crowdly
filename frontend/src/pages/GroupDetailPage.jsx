import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";
import {
  Users,
  Shield,
  Globe,
  Lock,
  UserCheck,
  UserPlus,
  ArrowLeft,
  Loader2,
} from "lucide-react";

export default function GroupDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts"); // posts | members

  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      const [groupData, postsData] = await Promise.all([
        apiRequest(`/groups/${id}`),
        apiRequest(`/groups/${id}/posts`),
      ]);

      setGroup(groupData);
      setPosts(postsData || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupDetails();
  }, [id]);

  const isMember = group?.members?.some(
    (m) => (m._id || m) === user?._id,
  );
  const isAdmin = (group?.admin?._id || group?.admin) === user?._id;

  const handleJoinLeave = async () => {
    try {
      const endpoint = isMember
        ? `/groups/${id}/leave`
        : `/groups/${id}/join`;
      const updated = await apiRequest(endpoint, { method: "POST" });
      setGroup(updated);
    } catch (err) {
      console.log(err);
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

  if (!group) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        <Navbar />
        <div className="max-w-xl mx-auto py-12 text-center text-slate-500">
          <p>Group not found.</p>
          <Link to="/groups" className="text-blue-600 font-semibold text-xs mt-2 inline-block">
            Back to Groups
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 antialiased flex flex-col">
      <Navbar />

      <div className="flex flex-1 w-full max-w-[1600px] mx-auto justify-between items-start">
        <LeftSidebar />

        <main className="flex-1 min-w-0 max-w-3xl xl:max-w-4xl mx-auto py-6 px-4 md:px-8 w-full space-y-6">
          {/* Back Button */}
          <Link
            to="/groups"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Groups</span>
          </Link>

          {/* Group Profile Header Banner Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="h-44 bg-slate-200 relative overflow-hidden">
              <img
                src={
                  group.coverImage ||
                  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
                }
                alt={group.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-xs font-semibold bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full uppercase">
                {group.privacy === "public" ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                {group.privacy}
              </span>
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">{group.name}</h1>
                  <p className="text-xs text-slate-500 mt-1 max-w-xl">
                    {group.description || "Welcome to the group! Connect and share posts with fellow members."}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      {group.members?.length || 1} Members
                    </span>
                    <span className="flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-amber-500" />
                      Admin: <strong className="text-slate-700">{group.admin?.username || "Admin"}</strong>
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleJoinLeave}
                  className={`px-5 py-2 font-semibold rounded-xl text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1.5 ${
                    isMember
                      ? "bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isMember ? (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>{isAdmin ? "Admin (Joined)" : "Leave Group"}</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Join Group</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Navigation Bar inside Group */}
            <div className="px-6 border-t border-slate-100 flex gap-4">
              <button
                onClick={() => setActiveTab("posts")}
                className={`py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === "posts"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Group Feed ({posts.length})
              </button>
              <button
                onClick={() => setActiveTab("members")}
                className={`py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === "members"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                Members ({group.members?.length || 0})
              </button>
            </div>
          </div>

          {/* Group Posts Tab */}
          {activeTab === "posts" && (
            <div className="space-y-5">
              {isMember ? (
                <CreatePost setPosts={setPosts} groupId={group._id} />
              ) : (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 text-xs font-medium text-center">
                  Join this group to create posts and interact with members!
                </div>
              )}

              {posts.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-400">
                  <p className="text-sm">No group posts yet. Be the first to share something!</p>
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard key={post._id} post={post} setPosts={setPosts} />
                ))
              )}
            </div>
          )}

          {/* Group Members Tab */}
          {activeTab === "members" && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800">Group Members</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {group.members?.map((member) => {
                  const memberIsAdmin = (member._id || member) === group.admin?._id;
                  return (
                    <div
                      key={member._id || member}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <img
                        src={
                          member.avatar ||
                          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                        }
                        alt={member.username}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-semibold text-slate-800 truncate">
                            {member.username}
                          </h4>
                          {memberIsAdmin && (
                            <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.2 rounded-md">
                              Admin
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 truncate block">
                          {member.email}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
