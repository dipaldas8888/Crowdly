import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
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
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create Group form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [coverImage, setCoverImage] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);

  const fetchGroupsData = async () => {
    try {
      setLoading(true);
      const [allData, myData] = await Promise.all([
        apiRequest("/groups"),
        apiRequest("/groups/my"),
      ]);

      setGroups(allData || []);
      setMyGroups(myData || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupsData();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const results = await apiRequest(
        `/groups?search=${encodeURIComponent(searchQuery)}`,
      );
      setGroups(results || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("privacy", privacy);
    if (coverImage) {
      formData.append("coverImage", coverImage);
    }

    try {
      setCreateLoading(true);
      const newGroup = await apiRequest("/groups", {
        method: "POST",
        body: formData,
      });

      setGroups((prev) => [newGroup, ...prev]);
      setMyGroups((prev) => [newGroup, ...prev]);

      setShowCreateModal(false);
      setName("");
      setDescription("");
      setPrivacy("public");
      setCoverImage(null);
    } catch (err) {
      console.log(err);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoinLeave = async (groupId, isMember) => {
    try {
      const endpoint = isMember
        ? `/groups/${groupId}/leave`
        : `/groups/${groupId}/join`;
      const updated = await apiRequest(endpoint, { method: "POST" });

      setGroups((prev) =>
        prev.map((g) => (g._id === groupId ? updated : g)),
      );
      if (isMember) {
        setMyGroups((prev) => prev.filter((g) => g._id !== groupId));
      } else {
        setMyGroups((prev) => [...prev, updated]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const displayedGroups = activeTab === "discover" ? groups : myGroups;

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 antialiased flex flex-col">
      <Navbar />

      <div className="flex flex-1 w-full max-w-[1600px] mx-auto justify-between items-start">
        <LeftSidebar />

        <main className="flex-1 min-w-0 max-w-3xl xl:max-w-4xl mx-auto py-6 px-4 md:px-8 w-full space-y-6">
          {/* Header Banner */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Groups & Communities</h1>
                <p className="text-sm text-slate-500 mt-0.5">Discover communities, share group posts, or create your own group</p>
              </div>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
              <span>Create Group</span>
            </button>
          </div>

          {/* Search Bar & Tabs */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("discover")}
                className={`px-4 py-2.5 text-sm font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === "discover"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                Discover Groups ({groups.length})
              </button>
              <button
                onClick={() => setActiveTab("my")}
                className={`px-4 py-2.5 text-sm font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === "my"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                My Groups ({myGroups.length})
              </button>
            </div>

            <form onSubmit={handleSearch} className="relative flex-1 max-w-xs">
              <Search className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
              />
            </form>
          </div>

          {/* Groups Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-4 h-48 animate-pulse border border-slate-200"></div>
              ))}
            </div>
          ) : displayedGroups.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 text-slate-400">
              <p className="text-base">No groups found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {displayedGroups.map((group) => {
                const isMember = group.members?.some(
                  (m) => (m._id || m) === group.admin?._id || false,
                );
                return (
                  <div
                    key={group._id}
                    className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between group hover:shadow-sm transition-shadow"
                  >
                    {/* Group Cover Banner */}
                    <div className="h-28 bg-slate-200 relative overflow-hidden">
                      <img
                        src={
                          group.coverImage ||
                          "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80"
                        }
                        alt={group.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 right-2 inline-flex items-center gap-1 text-xs font-bold bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-lg uppercase">
                        {group.privacy === "public" ? (
                          <Globe className="w-3.5 h-3.5" />
                        ) : (
                          <Lock className="w-3.5 h-3.5" />
                        )}
                        {group.privacy}
                      </span>
                    </div>

                    {/* Content Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <Link
                          to={`/groups/${group._id}`}
                          className="font-bold text-slate-900 text-lg hover:text-blue-600 transition-colors block"
                        >
                          {group.name}
                        </Link>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                          {group.description || "No description provided."}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100 text-xs">
                        <span className="text-slate-400 font-medium">
                          {group.members?.length || 1} members
                        </span>

                        <div className="flex items-center gap-2">
                          <Link
                            to={`/groups/${group._id}`}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors text-xs"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => handleJoinLeave(group._id, isMember)}
                            className={`px-3 py-1.5 font-semibold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1 ${
                              isMember
                                ? "bg-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-600"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                          >
                            {isMember ? (
                              <>
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Joined</span>
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-3.5 h-3.5" />
                                <span>Join</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Create Group Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-slate-900">Create New Group</h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateGroup} className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Group Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Developers Lounge"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Description</label>
                    <textarea
                      placeholder="What is this group about?"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Privacy</label>
                    <select
                      value={privacy}
                      onChange={(e) => setPrivacy(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="public">Public (Anyone can view & join)</option>
                      <option value="private">Private (Only members can view)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Cover Image</label>
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
                        className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 border border-slate-200 text-slate-700 rounded-xl cursor-pointer hover:bg-slate-200"
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
                      className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createLoading || !name.trim()}
                      className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {createLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>Create Group</span>
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
