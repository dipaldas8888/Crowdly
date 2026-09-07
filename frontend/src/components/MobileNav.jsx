import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import NotificationsDropdown from "./NotificationsDropdown";
import {
  Home,
  Users,
  Layers,
  MessageSquare,
  Bell,
  X,
  LogOut,
  Settings,
  Video,
  UserCircle,
  Zap,
  AlignJustify,
} from "lucide-react";

export default function MobileNav() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const [showDrawer, setShowDrawer] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: Users, label: "Friends", path: "/friends" },
    { icon: Bell, label: "Alerts", path: null, badge: unreadCount, action: () => setShowNotif((v) => !v) },
    { icon: MessageSquare, label: "Messages", path: "/messages" },
    { icon: AlignJustify, label: "Menu", path: null, action: () => setShowDrawer(true) },
  ];

  const drawerLinks = [
    { icon: Home, label: "Home Feed", path: "/home", color: "bg-blue-100 text-blue-600" },
    { icon: UserCircle, label: "My Profile", path: "/profile", color: "bg-violet-100 text-violet-600" },
    { icon: Users, label: "Friends", path: "/friends", color: "bg-emerald-100 text-emerald-600" },
    { icon: Layers, label: "Groups", path: "/groups", color: "bg-amber-100 text-amber-600" },
    { icon: Video, label: "Watch", path: "/watch", color: "bg-rose-100 text-rose-600" },
    { icon: MessageSquare, label: "Messages", path: "/messages", color: "bg-sky-100 text-sky-600" },
    { icon: Settings, label: "Settings", path: "/settings", color: "bg-slate-100 text-slate-500" },
  ];

  return (
    <>
      {/* ── Fixed Bottom Tab Bar ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 md:hidden">
        <div className="flex items-stretch h-[58px]">
          {navItems.map((item, idx) => {
            const Icon = item.icon;

            if (item.path) {
              const active = isActive(item.path);
              return (
                <Link
                  key={idx}
                  to={item.path}
                  className="relative flex-1 flex flex-col items-center justify-center gap-[3px] transition-colors"
                >
                  {/* Active indicator bar at top */}
                  {active && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-blue-600 rounded-b-full" />
                  )}
                  <div className={`relative p-1.5 rounded-xl transition-colors ${active ? "bg-blue-50" : ""}`}>
                    <Icon className={`w-[22px] h-[22px] transition-colors ${active ? "text-blue-600" : "text-slate-400"}`} />
                    {/* Badge for alerts */}
                    {item.badge > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-0.5 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white leading-none">
                        {item.badge > 9 ? "9+" : item.badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-semibold leading-none ${active ? "text-blue-600" : "text-slate-400"}`}>
                    {item.label}
                  </span>
                </Link>
              );
            }

            // Action button (Menu)
            return (
              <button
                key={idx}
                onClick={item.action}
                className="relative flex-1 flex flex-col items-center justify-center gap-[3px] transition-colors cursor-pointer"
              >
                <div className="p-1.5 rounded-xl">
                  <Icon className="w-[22px] h-[22px] text-slate-400" />
                </div>
                <span className="text-[10px] font-semibold leading-none text-slate-400">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Notifications Panel (above bottom bar) ── */}
      {showNotif && (
        <>
          <div
            className="fixed inset-0 z-[55] md:hidden"
            onClick={() => setShowNotif(false)}
          />
          <div className="fixed bottom-[58px] left-2 right-2 z-[56] md:hidden max-h-[70vh] overflow-y-auto rounded-2xl shadow-2xl border border-slate-200">
            <NotificationsDropdown onClose={() => setShowNotif(false)} />
          </div>
        </>
      )}

      {/* ── Slide-in Drawer ── */}
      {showDrawer && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setShowDrawer(false)}
          />

          {/* Drawer Panel */}
          <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-white shadow-2xl flex flex-col">
            {/* Header — Branding + User */}
            <div className="p-5 bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
                </div>
                <div>
                  <p className="font-black text-white text-base leading-tight">Crowdly</p>
                  <p className="text-blue-200 text-xs font-medium truncate max-w-[140px]">
                    {user?.handle || user?.email || "Welcome back!"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDrawer(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* User Info Strip */}
            <Link
              to="/profile"
              onClick={() => setShowDrawer(false)}
              className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <img
                src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"}
                alt={user?.username}
                className="w-10 h-10 rounded-full object-cover border-2 border-blue-100 shadow-sm"
              />
              <div className="min-w-0">
                <p className="font-bold text-slate-900 text-sm truncate">{user?.username || "User"}</p>
                <p className="text-xs text-blue-600 font-medium">View my profile →</p>
              </div>
            </Link>

            {/* Nav Links */}
            <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
              {drawerLinks.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setShowDrawer(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                      active
                        ? "bg-blue-50 text-blue-700"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${active ? "bg-blue-100 text-blue-600" : item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`text-sm font-semibold ${active ? "text-blue-700" : "text-slate-700"}`}>
                      {item.label}
                    </span>
                    {active && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="p-3 border-t border-slate-100">
              <button
                onClick={() => { setShowDrawer(false); logout(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer group"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-100 text-rose-500 group-hover:bg-rose-200 transition-colors">
                  <LogOut className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-rose-600">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
