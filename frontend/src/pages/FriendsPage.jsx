import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { apiRequest } from "../lib/api";
import Navbar from "../components/Navbar";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import {
  Users,
  UserCheck,
  UserPlus,
  Search,
  UserX,
  Check,
  X,
  Loader2,
  Circle,
} from "lucide-react";

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState("friends"); // friends | requests | suggested | search
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  const fetchFriendsData = async () => {
    try {
      setLoading(true);
      const [friendsData, requestsData, suggestedData] = await Promise.all([
        apiRequest("/friends"),
        apiRequest("/friends/requests"),
        apiRequest("/friends/suggested"),
      ]);

      setFriends(friendsData || []);
      setRequests(requestsData || []);
      setSuggested(suggestedData || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriendsData();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setSearchLoading(true);
      const results = await apiRequest(
        `/friends/search?q=${encodeURIComponent(searchQuery)}`,
      );
      setSearchResults(results || []);
    } catch (err) {
      console.log(err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      await apiRequest(`/friends/request/${userId}`, { method: "POST" });
      setSuggested((prev) => prev.filter((u) => u._id !== userId));
      setSearchResults((prev) =>
        prev.map((u) =>
          u._id === userId
            ? { ...u, requestSent: true }
            : u,
        ),
      );
      toast.success("Friend request sent!");
    } catch (err) {
      console.log(err);
      toast.error(err.message || "Failed to send request");
    }
  };

  const handleAcceptRequest = async (userId) => {
    try {
      await apiRequest(`/friends/accept/${userId}`, { method: "PUT" });
      toast.success("Friend request accepted!");
      fetchFriendsData();
    } catch (err) {
      console.log(err);
      toast.error(err.message || "Failed to accept request");
    }
  };

  const handleRejectRequest = async (userId) => {
    try {
      await apiRequest(`/friends/reject/${userId}`, { method: "PUT" });
      setRequests((prev) => prev.filter((u) => u._id !== userId));
      toast.info("Friend request declined.");
    } catch (err) {
      console.log(err);
      toast.error(err.message || "Failed to decline request");
    }
  };

  const handleRemoveFriend = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this friend?")) return;

    try {
      await apiRequest(`/friends/remove/${userId}`, { method: "DELETE" });
      setFriends((prev) => prev.filter((u) => u._id !== userId));
      toast.info("Friend removed.");
    } catch (err) {
      console.log(err);
      toast.error(err.message || "Failed to remove friend");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 antialiased flex flex-col">
      <Navbar />

      <div className="flex flex-1 w-full max-w-[1600px] mx-auto justify-between items-start">
        <LeftSidebar />

        <main className="flex-1 min-w-0 max-w-3xl xl:max-w-4xl mx-auto py-4 sm:py-6 px-3 sm:px-4 md:px-8 w-full space-y-4 sm:space-y-6 pb-16 md:pb-12">
          {/* Header Banner */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Friends & Connections</h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Manage your friends list, pending requests, and discover new connections
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs — Pill Bar */}
          <div className="bg-white rounded-2xl p-1.5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              {[
                { key: "friends", label: "My Friends", count: friends.length },
                { key: "requests", label: "Requests", count: requests.length },
                { key: "suggested", label: "Suggested", count: null },
                { key: "search", label: "Search Users", count: null },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    activeTab === tab.key
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span
                      className={`text-[11px] font-extrabold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 ${
                        activeTab === tab.key
                          ? tab.count > 0 && tab.key === "requests"
                            ? "bg-rose-400 text-white"
                            : "bg-white/25 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab 1: My Friends */}
          {activeTab === "friends" && (
            <div>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-2xl p-4 h-24 animate-pulse border border-slate-200"></div>
                  ))}
                </div>
              ) : friends.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 text-slate-400">
                  <p className="text-base">You haven't added any friends yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {friends.map((friend) => (
                    <div
                      key={friend._id}
                      className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="relative shrink-0">
                          <img
                            src={
                              friend.avatar ||
                              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                            }
                            alt={friend.username}
                            className="w-12 h-12 rounded-full object-cover border border-slate-100"
                          />
                          <span
                            className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                              friend.isOnline ? "bg-emerald-500" : "bg-slate-300"
                            }`}
                          ></span>
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-base font-bold text-slate-900 truncate">
                            {friend.username}
                          </h4>
                          <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Circle
                              className={`w-2.5 h-2.5 fill-current ${
                                friend.isOnline ? "text-emerald-500" : "text-slate-300"
                              }`}
                            />
                            {friend.isOnline ? "Online" : "Offline"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleRemoveFriend(friend._id)}
                          className="flex items-center gap-1.5 px-3 py-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer text-xs font-semibold border border-slate-200 hover:border-rose-200"
                          title="Remove Friend"
                        >
                          <UserX className="w-4 h-4" />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Friend Requests */}
          {activeTab === "requests" && (
            <div>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-white rounded-2xl p-4 h-24 animate-pulse border border-slate-200"></div>
                  ))}
                </div>
              ) : requests.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 text-slate-400">
                  <p className="text-base">No pending friend requests.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {requests.map((user) => (
                    <div
                      key={user._id}
                      className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={
                            user.avatar ||
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                          }
                          alt={user.username}
                          className="w-12 h-12 rounded-full object-cover border border-slate-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-base font-bold text-slate-900 truncate">
                            {user.username}
                          </h4>
                          <span className="text-xs text-slate-500 truncate block mt-0.5">
                            Sent you a friend request
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleAcceptRequest(user._id)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors cursor-pointer shadow-sm shadow-blue-500/20"
                          title="Accept"
                        >
                          <Check className="w-4 h-4" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleRejectRequest(user._id)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer border border-slate-200 hover:border-rose-200"
                          title="Decline"
                        >
                          <X className="w-4 h-4" />
                          <span>Decline</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Suggested Friends */}
          {activeTab === "suggested" && (
            <div>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-2xl p-4 h-24 animate-pulse border border-slate-200"></div>
                  ))}
                </div>
              ) : suggested.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 text-slate-400">
                  <p className="text-base">No suggested friends right now.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {suggested.map((user) => (
                    <div
                      key={user._id}
                      className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={
                            user.avatar ||
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                          }
                          alt={user.username}
                          className="w-12 h-12 rounded-full object-cover border border-slate-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-base font-bold text-slate-900 truncate">
                            {user.username}
                          </h4>
                          <span className="text-xs text-slate-500 mt-0.5 block">Suggested for you</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleSendRequest(user._id)}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors cursor-pointer shrink-0"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Add Friend</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Search Users */}
          {activeTab === "search" && (
            <div className="space-y-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={searchLoading || !searchQuery.trim()}
                  className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer flex items-center gap-2"
                >
                  {searchLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Search</span>
                </button>
              </form>

              {searchResults.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {searchResults.map((user) => (
                    <div
                      key={user._id}
                      className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={
                            user.avatar ||
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                          }
                          alt={user.username}
                          className="w-12 h-12 rounded-full object-cover border border-slate-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-base font-bold text-slate-900 truncate">
                            {user.username}
                          </h4>
                          <span className="text-xs text-slate-500 truncate block mt-0.5">
                            {user.email}
                          </span>
                        </div>
                      </div>

                      {user.requestSent ? (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl flex items-center gap-1">
                          <UserCheck className="w-4 h-4" /> Request Sent
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSendRequest(user._id)}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors cursor-pointer shrink-0"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>Add Friend</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : searchQuery && !searchLoading ? (
                <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 text-slate-400">
                  <p className="text-base">No users found matching "{searchQuery}".</p>
                </div>
              ) : null}
            </div>
          )}
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
