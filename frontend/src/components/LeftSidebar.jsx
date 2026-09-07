import { useAuth } from "../context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  Tv,
  Clock,
  Store,
  MessageSquare,
  Settings,
  Layers,
  Bookmark,
  Calendar,
} from "lucide-react";

export default function LeftSidebar() {
  const { user } = useAuth();
  const location = useLocation();

  const mainItems = [
    { icon: Home, label: "Feed", path: "/home", color: "text-blue-600 bg-blue-50" },
    { icon: Users, label: "Friends", path: "/friends", color: "text-indigo-600 bg-indigo-50" },
    { icon: Layers, label: "Groups", path: "/groups", color: "text-emerald-600 bg-emerald-50" },
    { icon: Tv, label: "Watch", path: "/watch", color: "text-purple-600 bg-purple-50" },
    { icon: MessageSquare, label: "Messages", path: "/messages", color: "text-sky-600 bg-sky-50" },
  ];

  const secondaryItems = [
    { icon: Bookmark, label: "Saved", path: "#", color: "text-amber-600 bg-amber-50" },
    { icon: Clock, label: "Memories", path: "#", color: "text-rose-500 bg-rose-50" },
    { icon: Calendar, label: "Events", path: "#", color: "text-teal-600 bg-teal-50" },
    { icon: Store, label: "Marketplace", path: "#", color: "text-orange-500 bg-orange-50" },
    { icon: Settings, label: "Settings", path: "/settings", color: "text-slate-600 bg-slate-100" },
  ];

  return (
    <aside className="w-60 xl:w-64 shrink-0 hidden md:flex flex-col bg-white border-r border-slate-200/80 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto p-3 scrollbar-thin">
      <div className="space-y-1">
        {/* User Profile Header */}
        <Link
          to="/profile"
          className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors mb-2 group"
        >
          <div className="relative shrink-0">
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"}
              alt={user?.username || "User"}
              className="w-9 h-9 rounded-full object-cover border-2 border-slate-200 group-hover:border-blue-300 transition-colors"
            />
          </div>
          <div className="min-w-0">
            <span className="font-bold text-slate-800 text-sm truncate block group-hover:text-blue-600 transition-colors">
              {user?.username || "My Profile"}
            </span>
            <span className="text-[11px] text-slate-400 font-medium truncate block">
              {user?.handle || "View profile"}
            </span>
          </div>
        </Link>

        {/* Divider */}
        <div className="h-px bg-slate-100 mb-2" />

        {/* Main Nav */}
        <nav className="space-y-0.5">
          {mainItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-2.5 py-2 rounded-xl cursor-pointer transition-all group ${
                  active
                    ? "bg-blue-50 text-blue-600"
                    : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${active ? "bg-blue-100 text-blue-600" : item.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-sm font-semibold ${active ? "text-blue-700" : "text-slate-700"}`}>
                  {item.label}
                </span>
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
              </Link>
            );
          })}
        </nav>

        {/* Divider + Explore Section */}
        <div className="pt-3">
          <p className="px-2.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">
            Explore
          </p>
          <nav className="space-y-0.5">
            {secondaryItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path && item.path !== "#";
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex items-center gap-3 px-2.5 py-2 rounded-xl cursor-pointer transition-all group ${
                    active
                      ? "bg-blue-50 text-blue-600"
                      : "hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${active ? "bg-blue-100 text-blue-600" : item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-4 pb-1 px-2.5">
        <p className="text-[10px] text-slate-300 font-medium">
          © 2026 Crowdly · All rights reserved
        </p>
      </div>
    </aside>
  );
}
