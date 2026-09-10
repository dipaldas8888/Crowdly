import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import NotificationsDropdown from "./NotificationsDropdown";
import CreatePortalModal from "./CreatePortalModal";
import { Link, useLocation } from "react-router-dom";
import {
  Search,
  Bell,
  MessageSquare,
  Home,
  Zap,
  Video,
  Users,
  Layers,
  Plus,
} from "lucide-react";

export default function Navbar() {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showCreatePortal, setShowCreatePortal] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200/80 shadow-xs">
        {/* Top Blue Accent Stripe */}
        <div className="h-[3px] bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 w-full" />

        <div className="max-w-[1600px] mx-auto px-3 sm:px-4 md:px-6 h-14 flex items-center justify-between gap-2 sm:gap-3">
          {/* ── Left: Brand Logo & Search ── */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-5 shrink-0">
            <Link
              to="/home"
              className="flex items-center gap-2 group cursor-pointer"
              title="Crowdly Home"
            >
              {/* Glowing Icon Badge */}
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 fill-amber-300" />
              </div>

              {/* Vibrant Brand Text */}
              <div className="hidden xs:flex items-baseline leading-none">
                <span className="text-xl sm:text-2xl font-black text-blue-600 tracking-tight group-hover:text-blue-700 transition-colors">
                  Crowdly
                </span>
                <span className="text-xl sm:text-2xl font-black text-amber-500">.</span>
              </div>
            </Link>

            {/* Search Bar — hidden on xs, inline on sm+ */}
            <div className="relative hidden sm:block w-36 md:w-52 lg:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-slate-100/90 border border-transparent rounded-full pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* ── Center: Quick Navigation Pills — Desktop only ── */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {[
              { path: "/home", icon: Home, title: "Home" },
              { path: "/watch", icon: Video, title: "Watch" },
              { path: "/friends", icon: Users, title: "Friends" },
              { path: "/groups", icon: Layers, title: "Groups" },
            ].map(({ path, icon: Icon, title }) => (
              <Link
                key={path}
                to={path}
                title={title}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  isActive(path)
                    ? "bg-blue-100 text-blue-600 shadow-xs font-bold"
                    : "bg-slate-100/80 hover:bg-slate-200/80 text-slate-500 hover:text-slate-800"
                }`}
              >
                <Icon className="w-5 h-5" />
              </Link>
            ))}
          </nav>

          {/* ── Right Section: Actions & User Avatar ── */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0 relative">
            {/* Create Portal Action Button */}
            <button
              onClick={() => setShowCreatePortal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:scale-105 transition-all cursor-pointer"
              title="Create Portal"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Create</span>
            </button>

            {/* Mobile Search Toggle */}
            <button
              onClick={() => setShowMobileSearch((v) => !v)}
              className="sm:hidden p-2 rounded-full text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications((prev) => !prev)}
                className={`relative p-2 sm:p-2.5 rounded-full transition-colors cursor-pointer ${
                  showNotifications
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-0.5 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <NotificationsDropdown onClose={() => setShowNotifications(false)} />
              )}
            </div>

            {/* Messages — hidden on mobile */}
            <Link
              to="/messages"
              className={`hidden sm:flex p-2 sm:p-2.5 rounded-full transition-colors cursor-pointer ${
                isActive("/messages")
                  ? "text-blue-600 bg-blue-50"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
              title="Messages"
            >
              <MessageSquare className="w-5 h-5" />
            </Link>

            {/* User Profile Avatar */}
            <Link to="/profile" className="ml-0.5 sm:ml-1 flex items-center cursor-pointer">
              <img
                src={
                  user?.avatar ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                }
                alt={user?.username || "User"}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-slate-200 hover:ring-2 hover:ring-blue-500 transition-all shadow-xs"
              />
            </Link>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {showMobileSearch && (
          <div className="sm:hidden p-2.5 bg-slate-50 border-t border-slate-200">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search Crowdly..."
                className="w-full bg-white border border-slate-200 rounded-full pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>
          </div>
        )}
      </header>

      {/* Global Create Portal Modal */}
      <CreatePortalModal
        isOpen={showCreatePortal}
        onClose={() => setShowCreatePortal(false)}
      />
    </>
  );
}
