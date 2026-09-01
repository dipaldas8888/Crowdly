import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import {
  Search,
  Bell,
  MessageSquare,
  LogOut,
  Home,
  Zap,
  Video,
  Users,
  Settings,
  Layers,
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200/80 shadow-xs">
      {/* Top Blue Accent Stripe */}
      <div className="h-[3px] bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 w-full" />

      <div className="max-w-[1600px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-3">
        {/* ── Left: Brand Logo & Search ── */}
        <div className="flex items-center gap-3 lg:gap-5 shrink-0">
          <Link
            to="/home"
            className="flex items-center gap-2.5 group cursor-pointer"
            title="Crowdly Home"
          >
            {/* Glowing Icon Badge */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
            </div>

            {/* Vibrant Brand Text */}
            <div className="flex items-baseline leading-none">
              <span className="text-2xl font-black text-blue-600 tracking-tight group-hover:text-blue-700 transition-colors">
                Crowdly
              </span>
              <span className="text-2xl font-black text-amber-500">.</span>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="relative w-44 sm:w-56 md:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Start typing to search..."
              className="w-full bg-slate-100/90 border border-transparent rounded-full pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* ── Center: Quick Navigation Pills (Matching Reference Design) ── */}
        <nav className="hidden lg:flex items-center gap-2">
          {/* Home */}
          <Link
            to="/home"
            title="Home"
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isActive("/home")
                ? "bg-blue-100 text-blue-600 shadow-xs font-bold"
                : "bg-slate-100/80 hover:bg-slate-200/80 text-slate-500 hover:text-slate-800"
            }`}
          >
            <Home className="w-5 h-5" />
          </Link>

          {/* Explore / Trending */}
          <Link
            to="/watch"
            title="Explore & Trending"
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isActive("/watch")
                ? "bg-blue-100 text-blue-600 shadow-xs font-bold"
                : "bg-slate-100/80 hover:bg-slate-200/80 text-slate-500 hover:text-slate-800"
            }`}
          >
            <Zap className="w-5 h-5" />
          </Link>

          {/* Watch Videos */}
          <Link
            to="/watch"
            title="Watch Videos"
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isActive("/watch")
                ? "bg-blue-100 text-blue-600 shadow-xs font-bold"
                : "bg-slate-100/80 hover:bg-slate-200/80 text-slate-500 hover:text-slate-800"
            }`}
          >
            <Video className="w-5 h-5" />
          </Link>

          {/* Friends */}
          <Link
            to="/friends"
            title="Friends"
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isActive("/friends")
                ? "bg-blue-100 text-blue-600 shadow-xs font-bold"
                : "bg-slate-100/80 hover:bg-slate-200/80 text-slate-500 hover:text-slate-800"
            }`}
          >
            <Users className="w-5 h-5" />
          </Link>

          {/* Groups */}
          <Link
            to="/groups"
            title="Groups"
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isActive("/groups")
                ? "bg-blue-100 text-blue-600 shadow-xs font-bold"
                : "bg-slate-100/80 hover:bg-slate-200/80 text-slate-500 hover:text-slate-800"
            }`}
          >
            <Layers className="w-5 h-5" />
          </Link>
        </nav>

        {/* ── Right Section: Actions & User Avatar ── */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 relative">
          {/* Notifications Bell */}
          <button
            className="relative p-2.5 text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full border border-white" />
          </button>

          {/* Messages */}
          <Link
            to="/messages"
            className={`p-2.5 rounded-full transition-colors cursor-pointer ${
              isActive("/messages")
                ? "text-blue-600 bg-blue-50"
                : "text-slate-600 hover:bg-slate-100"
            }`}
            title="Messages"
          >
            <MessageSquare className="w-5 h-5" />
          </Link>

          {/* Settings Menu Button */}
          <div className="relative">
            <button
              onClick={() => setShowSettingsMenu((prev) => !prev)}
              className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              title="Settings & Options"
            >
              <Settings className="w-5 h-5" />
            </button>

            {showSettingsMenu && (
              <div className="absolute right-0 top-11 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-2 w-48 text-xs font-medium">
                <Link
                  to="/profile"
                  onClick={() => setShowSettingsMenu(false)}
                  className="px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                >
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>My Profile</span>
                </Link>
                <div className="h-[1px] bg-slate-100 my-1" />
                <button
                  onClick={() => {
                    setShowSettingsMenu(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-rose-50 flex items-center gap-2 text-rose-600 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <Link to="/profile" className="ml-1 flex items-center cursor-pointer">
            <img
              src={
                user?.avatar ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
              }
              alt={user?.username || "User"}
              className="w-9 h-9 rounded-full object-cover border border-slate-200 hover:ring-2 hover:ring-blue-500 transition-all shadow-xs"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
