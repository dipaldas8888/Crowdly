import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  Tv,
  MessageSquare,
  Settings,
  Layers,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";

export default function LeftSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("crowdly_sidebar_collapsed") === "true";
  });

  // Automatically collapse sidebar on Settings page
  useEffect(() => {
    if (location.pathname === "/settings") {
      setIsCollapsed(true);
    }
  }, [location.pathname]);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("crowdly_sidebar_collapsed", String(next));
      return next;
    });
  };

  const mainItems = [
    { icon: Home, label: "Feed", path: "/home", color: "text-blue-600 bg-blue-50" },
    { icon: Users, label: "Friends", path: "/friends", color: "text-indigo-600 bg-indigo-50" },
    { icon: Layers, label: "Groups", path: "/groups", color: "text-emerald-600 bg-emerald-50" },
    { icon: Tv, label: "Watch", path: "/watch", color: "text-purple-600 bg-purple-50" },
    { icon: MessageSquare, label: "Messages", path: "/messages", color: "text-sky-600 bg-sky-50" },
  ];

  const secondaryItems = [
    { icon: Bookmark, label: "Saved", path: "/saved", color: "text-amber-600 bg-amber-50" },
    { icon: Settings, label: "Settings", path: "/settings", color: "text-slate-600 bg-slate-100" },
  ];

  return (
    <aside
      className={`
        shrink-0 hidden md:flex flex-col
        bg-white border-r border-slate-200/80
        sticky top-14 h-[calc(100vh-3.5rem)]
        overflow-y-auto p-3 scrollbar-thin transition-all duration-300 relative
        ${isCollapsed ? "w-16" : "w-60 xl:w-64"}
      `}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={toggleCollapse}
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute top-2 right-1.5 p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors z-10"
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <div className="space-y-1">
        {/* User Profile Header */}
        <Link
          to="/profile"
          className={`flex items-center ${
            isCollapsed ? "justify-center my-0.5" : "gap-2.5"
          } p-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 cursor-pointer transition-colors mb-2 group`}
          title={isCollapsed ? user?.username || "My Profile" : undefined}
        >
          <div className="relative shrink-0">
            <img
              src={
                user?.avatar ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
              }
              alt={user?.username || "User"}
              className="w-9 h-9 rounded-full object-cover border-2 border-slate-200 group-hover:border-blue-400 transition-all"
            />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 pr-6">
              <span className="font-bold text-slate-800 text-sm truncate block group-hover:text-blue-600 transition-colors">
                {user?.username || "My Profile"}
              </span>
              <span className="text-[11px] text-slate-400 font-medium truncate block">
                {user?.handle || "View profile"}
              </span>
            </div>
          )}
        </Link>

        {/* Divider */}
        <div className="h-px bg-slate-100 mb-2" />

        {/* Main Nav */}
        <nav className="space-y-1">
          {mainItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center ${
                  isCollapsed ? "justify-center py-1.5" : "gap-3 px-2.5 py-2.5"
                } rounded-xl cursor-pointer transition-all group ${
                  active
                    ? "bg-blue-50/80 text-blue-600 font-bold"
                    : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div
                  className={`${
                    isCollapsed ? "w-9 h-9 rounded-xl" : "w-8 h-8 rounded-lg"
                  } flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                    active
                      ? "bg-blue-600 text-white shadow-xs"
                      : item.color
                  }`}
                >
                  <Icon className={isCollapsed ? "w-4.5 h-4.5 stroke-[2]" : "w-4 h-4"} />
                </div>
                {!isCollapsed && (
                  <span
                    className={`text-sm font-semibold ${
                      active ? "text-blue-700 font-bold" : "text-slate-700"
                    }`}
                  >
                    {item.label}
                  </span>
                )}
                {!isCollapsed && active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Divider + Explore Section */}
        <div className="pt-2">
          {!isCollapsed ? (
            <p className="px-2.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
              Explore
            </p>
          ) : (
            <div className="h-px bg-slate-100 my-1.5" />
          )}

          <nav className="space-y-1">
            {secondaryItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path && item.path !== "#";
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex items-center ${
                    isCollapsed ? "justify-center py-1.5" : "gap-3 px-2.5 py-2.5"
                  } rounded-xl cursor-pointer transition-all group ${
                    active
                      ? "bg-blue-50/80 text-blue-600 font-bold"
                      : "hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  <div
                    className={`${
                      isCollapsed ? "w-9 h-9 rounded-xl" : "w-8 h-8 rounded-lg"
                    } flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                      active
                        ? "bg-blue-600 text-white shadow-xs"
                        : item.color
                    }`}
                  >
                    <Icon className={isCollapsed ? "w-4.5 h-4.5 stroke-[2]" : "w-4 h-4"} />
                  </div>
                  {!isCollapsed && (
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Logout & Footer Section */}
      <div className="mt-auto pt-3 border-t border-slate-100 space-y-2">
        <button
          onClick={logout}
          title={isCollapsed ? "Logout" : undefined}
          className={`w-full flex items-center ${
            isCollapsed ? "justify-center" : "gap-3 px-2.5"
          } py-2 rounded-xl text-rose-600 font-bold hover:bg-rose-50 cursor-pointer transition-colors group`}
        >
          <div
            className={`${
              isCollapsed ? "w-9 h-9 rounded-xl" : "w-8 h-8 rounded-lg"
            } bg-rose-50 group-hover:bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}
          >
            <LogOut className={isCollapsed ? "w-4.5 h-4.5 stroke-[2]" : "w-4 h-4"} />
          </div>
          {!isCollapsed && <span className="text-sm font-bold">Logout</span>}
        </button>

        {!isCollapsed && (
          <div className="px-2.5 pt-1">
            <p className="text-[10px] text-slate-400 font-medium">
              © 2026 Crowdly · All rights reserved
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
