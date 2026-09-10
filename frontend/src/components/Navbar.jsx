import { useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import NotificationsDropdown from "./NotificationsDropdown";
import CreatePortalModal from "./CreatePortalModal";
import CrowdlyLogo from "./CrowdlyLogo";
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
  AlignJustify,
  X,
  Bookmark,
  Settings,
  LogOut,
  ChevronRight,
  User,
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showCreatePortal, setShowCreatePortal] = useState(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200/80 shadow-xs">
        {/* Top Blue Accent Stripe */}
        <div className="h-[3px] bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 w-full" />

        <div className="max-w-[1600px] mx-auto px-2.5 sm:px-4 md:px-6 h-14 flex items-center justify-between gap-1.5 sm:gap-3">
          {/* ── Left: Brand Logo & Search & Hamburger ── */}
          <div className="flex items-center gap-1.5 sm:gap-3 lg:gap-5 shrink-0">
            {/* Mobile/Tablet Hamburger Button */}
            <button
              onClick={() => setShowMobileDrawer(true)}
              className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-700 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
              title="Open Navigation Menu"
            >
              <AlignJustify className="w-5 h-5 stroke-[2.5]" />
            </button>

            <CrowdlyLogo size="md" showText={true} />


            {/* Search Bar — hidden on xs, inline on sm+ */}
            <div className="relative hidden sm:block w-36 md:w-52 lg:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search Crowdly..."
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
              { path: "/saved", icon: Bookmark, title: "Saved Posts" },
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
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Create Portal Action Button */}
            <button
              onClick={() => setShowCreatePortal(true)}
              className="flex items-center justify-center p-2 sm:px-3 sm:py-1.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Create Portal"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Create</span>
            </button>

            {/* Mobile Search Toggle */}
            <button
              onClick={() => setShowMobileSearch((v) => !v)}
              className="sm:hidden p-1.5 rounded-full text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications((prev) => !prev)}
                className={`relative p-1.5 sm:p-2.5 rounded-full transition-colors cursor-pointer ${
                  showNotifications
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] px-0.5 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <NotificationsDropdown onClose={() => setShowNotifications(false)} />
              )}
            </div>

            {/* Messages — hidden on mobile since it is in bottom bar */}
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

      {/* ── Mobile/Tablet Bottom Navigation Bar ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {[
          { path: "/home", label: "Feed", icon: Home },
          { path: "/friends", label: "Friends", icon: Users },
          { path: "/groups", label: "Groups", icon: Layers },
          { path: "/messages", label: "Messages", icon: MessageSquare },
        ].map(({ path, label, icon: Icon }) => {
          const active = isActive(path);
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                active
                  ? "text-blue-600 font-bold scale-105"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {active && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 font-semibold">{label}</span>
            </Link>
          );
        })}

        {/* Menu Drawer Toggle Button */}
        <button
          onClick={() => setShowMobileDrawer(true)}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            showMobileDrawer
              ? "text-blue-600 font-bold scale-105"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <AlignJustify className="w-5 h-5 stroke-[2.5]" />
          <span className="text-[10px] mt-0.5 font-semibold">Menu</span>
        </button>
      </nav>

      {/* ── Mobile Hamburger Navigation Drawer ── */}
      {showMobileDrawer &&
        createPortal(
          <div className="fixed inset-0 z-[100] lg:hidden">
            {/* Dim Backdrop */}
            <div
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
              onClick={() => setShowMobileDrawer(false)}
            />

            {/* Slide-out Drawer Panel */}
            <div className="absolute left-0 top-0 bottom-0 w-[290px] sm:w-[320px] bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
              {/* Header Banner */}
              <div className="p-5 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-between shadow-md">
                <CrowdlyLogo size="md" lightText={true} />
                <button
                  onClick={() => setShowMobileDrawer(false)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Close Menu"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* User Profile Banner */}
              <Link
                to="/profile"
                onClick={() => setShowMobileDrawer(false)}
                className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between hover:bg-slate-100/80 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={
                      user?.avatar ||
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                    }
                    alt={user?.username}
                    className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-xs"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-sm truncate">
                      {user?.username || "User"}
                    </p>
                    <p className="text-xs text-blue-600 font-semibold truncate">
                      {user?.handle || "View my profile →"}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </Link>

              {/* Scrollable Navigation List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin">
                {/* Main Navigation */}
                <div>
                  <p className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                    Main Pages
                  </p>
                  <nav className="space-y-1">
                    {[
                      { label: "Feed / Home", path: "/home", icon: Home, color: "text-blue-600 bg-blue-50" },
                      { label: "Friends", path: "/friends", icon: Users, color: "text-indigo-600 bg-indigo-50" },
                      { label: "Groups", path: "/groups", icon: Layers, color: "text-emerald-600 bg-emerald-50" },
                      { label: "Watch Videos", path: "/watch", icon: Video, color: "text-rose-600 bg-rose-50" },
                      { label: "Messages", path: "/messages", icon: MessageSquare, color: "text-sky-600 bg-sky-50" },
                    ].map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.path);
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setShowMobileDrawer(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                            active
                              ? "bg-blue-50 text-blue-600 font-bold"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              active ? "bg-blue-600 text-white" : item.color
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span>{item.label}</span>
                          {active && (
                            <span className="ml-auto w-2 h-2 rounded-full bg-blue-600 shadow-xs" />
                          )}
                        </Link>
                      );
                    })}
                  </nav>
                </div>

                {/* Personal & Collections */}
                <div>
                  <p className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
                    My Account & Saved
                  </p>
                  <nav className="space-y-1">
                    {[
                      { label: "Saved Posts", path: "/saved", icon: Bookmark, color: "text-amber-600 bg-amber-50" },
                      { label: "Profile", path: "/profile", icon: User, color: "text-purple-600 bg-purple-50" },
                      { label: "Settings", path: "/settings", icon: Settings, color: "text-slate-600 bg-slate-100" },
                    ].map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.path);
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setShowMobileDrawer(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                            active
                              ? "bg-blue-50 text-blue-600 font-bold"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              active ? "bg-blue-600 text-white" : item.color
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span>{item.label}</span>
                          {active && (
                            <span className="ml-auto w-2 h-2 rounded-full bg-blue-600 shadow-xs" />
                          )}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              </div>

              {/* Footer Logout Button */}
              <div className="p-3 border-t border-slate-100 bg-slate-50/50">
                <button
                  onClick={() => {
                    setShowMobileDrawer(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-600 font-bold hover:bg-rose-50 transition-colors cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-rose-100 group-hover:bg-rose-200 text-rose-600 flex items-center justify-center shrink-0 transition-colors">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

