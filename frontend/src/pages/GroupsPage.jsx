import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import { apiRequest } from "../lib/api";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import MobileNav from "../components/MobileNav";
import {
  Users,
  Plus,
  Search,
  Globe,
  Lock,
  UserCheck,
  UserPlus,
  X,
  Upload,
  Loader2,
} from "lucide-react";

export default function GroupsPage() {
  const [activeTab, setActiveTab] = useState("discover"); // discover | my
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [coverImage, setCoverImage] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);

  const fetchGroupsData = async () => {
    try {
      setLoading(true);
      const [allGroupsRes, myGroupsRes] = await Promise.all([
        apiRequest("/groups"),
        apiRequest("/groups/my"),
      ]);

      setGroups(allGroupsRes || []);
      setMyGroups(myGroupsRes || []);
    } catch (err) {
      console.error("Error fetching groups:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupsData();
  }, []);

  const handleJoinGroup = async (groupId) => {
    try {
      await apiRequest(`/groups/${groupId}/join`, { method: "POST" });
      toast.success("Joined group successfully!");
      fetchGroupsData();
    } catch (err) {
      toast.error(err.message || "Failed to join group");
    }
  };

  const handleLeaveGroup = async (groupId) => {
    try {
      await apiRequest(`/groups/${groupId}/leave`, { method: "POST" });
      toast.success("Left group");
      fetchGroupsData();
    } catch (err) {
      toast.error(err.message || "Failed to leave group");
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Group name is required");
      return;
    }

    try {
      setCreateLoading(true);
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("privacy", privacy);
      if (coverImage) {
        formData.append("coverImage", coverImage);
      }

      await apiRequest("/groups", {
        method: "POST",
        body: formData,
      });

      toast.success("Group created successfully!");
      setShowCreateModal(false);
      setName("");
      setDescription("");
      setCoverImage(null);
      fetchGroupsData();
    } catch (err) {
      toast.error(err.message || "Failed to create group");
    } finally {
      setCreateLoading(false);
    }
  };

  const displayedGroups =
    activeTab === "discover"
      ? groups.filter(
          (g) =>
            g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (g.description &&
              g.description.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      : myGroups.filter(
          (g) =>
            g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (g.description &&
              g.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 antialiased flex flex-col">
      <Navbar />

      <div className="flex flex-1 w-full max-w-[1600px] mx-auto justify-between items-start">
        <LeftSidebar />

        <main className="flex-1 min-w-0 max-w-3xl xl:max-w-4xl mx-auto py-4 sm:py-6 px-3 sm:px-4 md:px-8 w-full pb-16 md:pb-6">
          {/* Header Banner */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xs border border-slate-200/80 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Groups & Communities
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Discover communities, share group posts, or create your own group
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create Group</span>
            </button>
          </div>

          {/* Navigation Controls & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
            {/* Tabs */}
            <div className="flex items-center bg-slate-200/60 p-1 rounded-xl w-fit">
              <button
                onClick={() => setActiveTab("discover")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "discover"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Discover Groups ({groups.length})
              </button>
              <button
                onClick={() => setActiveTab("my")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "my"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                My Groups ({myGroups.length})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-xs"
              />
            </div>
          </div>

          {/* Groups Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : displayedGroups.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 mb-1">
                {activeTab === "discover" ? "No Groups Found" : "No Groups Joined Yet"}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                {activeTab === "discover"
                  ? "Try adjusting your search or create your own brand new group community!"
                  : "You haven't joined any groups yet. Explore available communities!"}
              </p>
              {activeTab === "discover" && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Create First Group
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedGroups.map((group) => {
                const isMember = group.isMember || group.members?.includes(group._id);
                return (
                  <div
                    key={group._id}
                    className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col group"
                  >
                    {/* Cover Image */}
                    <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
                      <img
                        src={
                          group.coverImage ||
                          "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80"
                        }
                        alt={group.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2 right-2 px-2.5 py-1 bg-black/50 backdrop-blur-xs text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                        {group.privacy === "private" ? (
                          <Lock className="w-3 h-3 text-amber-400" />
                        ) : (
                          <Globe className="w-3 h-3 text-emerald-400" />
                        )}
                        <span className="capitalize">{group.privacy || "public"}</span>
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <Link
                          to={`/groups/${group._id}`}
                          className="font-bold text-slate-900 text-base hover:text-blue-600 transition-colors line-clamp-1 block"
                        >
                          {group.name}
                        </Link>
                        <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-1">
                          {group.description || "No description provided."}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-slate-400">
                          {group.membersCount || group.members?.length || 1} members
                        </span>

                        {isMember ? (
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/groups/${group._id}`}
                              className="px-3 py-1.5 bg-blue-50 text-blue-600 font-bold text-xs rounded-xl hover:bg-blue-100 transition-colors"
                            >
                              View Group
                            </Link>
                            <button
                              onClick={() => handleLeaveGroup(group._id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Leave Group"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleJoinGroup(group._id)}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-xs"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Join</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Create Group Modal (Rendered via React createPortal directly on document.body) */}
          {showCreateModal &&
            createPortal(
              <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      Create New Group
                    </h3>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateGroup} className="space-y-3.5 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Group Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Developers Lounge"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900 font-medium"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Description</label>
                      <textarea
                        placeholder="What is this group about?"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900 font-medium"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Privacy</label>
                      <select
                        value={privacy}
                        onChange={(e) => setPrivacy(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-900 font-semibold"
                      >
                        <option value="public">Public (Anyone can view & join)</option>
                        <option value="private">Private (Only members can view)</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Cover Image</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          id="group-cover-file"
                          className="hidden"
                          onChange={(e) => setCoverImage(e.target.files[0])}
                        />
                        <label
                          htmlFor="group-cover-file"
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer hover:bg-slate-200 transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{coverImage ? coverImage.name : "Upload Cover Image"}</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setShowCreateModal(false)}
                        className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={createLoading || !name.trim()}
                        className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl disabled:opacity-50 flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        {createLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        <span>Create Group</span>
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

      <MobileNav />
    </div>
  );
}
