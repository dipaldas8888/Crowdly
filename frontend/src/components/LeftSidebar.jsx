import { useAuth } from "../context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  Store,
  Tv,
  Clock,
  Calendar,
  Gamepad2,
  Image,
  Video,
  MessageSquare,
  HeartHandshake,
  BookOpen,
  GraduationCap,
} from "lucide-react";

export default function LeftSidebar() {
  const { user } = useAuth();
  const location = useLocation();

  const mainItems = [
    {
      icon: Home,
      label: "Feed",
      path: "/home",
      color: "text-blue-600 bg-blue-50",
    },
    {
      icon: Users,
      label: "Friends",
      path: "/friends",
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      icon: Users,
      label: "Groups",
      path: "/groups",
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      icon: Store,
      label: "Marketplace",
      path: "#",
      color: "text-sky-500 bg-sky-50",
    },
    {
      icon: Tv,
      label: "Watch",
      path: "/watch",
      color: "text-purple-500 bg-purple-50",
    },
    {
      icon: Clock,
      label: "Memories",
      path: "#",
      color: "text-amber-500 bg-amber-50",
    },
  ];

  const shortcuts = [
    {
      icon: Calendar,
      label: "Events",
      color: "text-rose-500 bg-rose-50",
    },
    {
      icon: Gamepad2,
      label: "Gaming",
      color: "text-emerald-500 bg-emerald-50",
    },
    {
      icon: Image,
      label: "Gallery",
      color: "text-violet-500 bg-violet-50",
    },
    {
      icon: Video,
      label: "Videos",
      color: "text-pink-500 bg-pink-50",
    },
    {
      icon: MessageSquare,
      label: "Messages",
      path: "/messages",
      color: "text-teal-500 bg-teal-50",
    },
  ];

  const others = [
    {
      icon: HeartHandshake,
      label: "Fundraiser",
      color: "text-orange-500 bg-orange-50",
    },
    {
      icon: BookOpen,
      label: "Tutorials",
      color: "text-blue-600 bg-blue-50",
    },
    {
      icon: GraduationCap,
      label: "Courses",
      color: "text-indigo-600 bg-indigo-50",
    },
  ];

  return (
    <aside className="w-60 xl:w-64 shrink-0 hidden md:block bg-white border-r border-slate-200/80 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto p-3.5 scrollbar-thin">
      <div className="space-y-4">
        {/* User Profile Header */}
        <Link
          to="/profile"
          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
        >
          <img
            src={
              user?.avatar ||
              `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80`
            }
            alt={user?.username || "User"}
            className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-xs"
          />
          <span className="font-semibold text-slate-800 text-sm truncate">
            {user?.username || "John Doe"}
          </span>
        </Link>

        {/* Main Navigation Links */}
        <nav className="space-y-0.5">
          {mainItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={idx}
                to={item.path}
                className={`flex items-center gap-3 px-2.5 py-2 rounded-xl cursor-pointer transition-all group ${
                  isActive
                    ? "bg-blue-50/80 text-blue-600 font-semibold"
                    : "hover:bg-slate-100 text-slate-700 font-medium"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${item.color} group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Divider & Your Shortcuts */}
        <div className="pt-2 border-t border-slate-100">
          <p className="px-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Your shortcuts
          </p>
          <nav className="space-y-0.5">
            {shortcuts.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  to={item.path || "#"}
                  className="flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors group text-slate-700 font-medium"
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${item.color} group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm group-hover:text-slate-900">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Divider & Others */}
        <div className="pt-2 border-t border-slate-100">
          <p className="px-2.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Others
          </p>
          <nav className="space-y-0.5">
            {others.map((item, idx) => {
              const Icon = item.icon;
              return (
                <a
                  key={idx}
                  href="#"
                  className="flex items-center gap-3 px-2.5 py-2 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors group text-slate-700 font-medium"
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${item.color} group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm group-hover:text-slate-900">
                    {item.label}
                  </span>
                </a>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}
