import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import NotificationsDropdown from "./NotificationsDropdown";
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
  Menu,
  X,
} from "lucide-react";
import MobileNav from "./MobileNav";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

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
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 relative">

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

            {/* Messages — hidden on mobile (in bottom nav) */}
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

            {/* Settings Menu Button — desktop only */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setShowSettingsMenu((prev) => !prev)}
                className="p-2 sm:p-2.5 text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                title="Settings & Options"
              >
                <Settings className="w-5 h-5" />
              </button>

              {showSettingsMenu && (
                <div className="absolute right-0 top-11 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-2 w-52 text-xs font-medium">
                  <Link
                    to="/profile"
                    onClick={() => setShowSettingsMenu(false)}
                    className="px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700"
                  >
                    <Users className="w-4 h-4 text-blue-500" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setShowSettingsMenu(false)}
                    className="px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700"
                  >
                    <Settings className="w-4 h-4 text-indigo-500" />
                    <span>Settings & Privacy</span>
                  </Link>
                  <div className="h-[1px] bg-slate-100 my-1" />
                  <button
                    onClick={() => {
                      setShowSettingsMenu(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-rose-50 flex items-center gap-2.5 text-rose-600 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>

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

        {/* Mobile Search Bar — expands below navbar */}
        {showMobileSearch && (
          <div className="sm:hidden px-3 pb-2.5 pt-1 border-t border-slate-100 bg-white flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                autoFocus
                type="text"
                placeholder="Search Crowdly..."
                className="w-full bg-slate-100 rounded-full pl-8 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
            <button
              onClick={() => setShowMobileSearch(false)}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </>
  );
}
