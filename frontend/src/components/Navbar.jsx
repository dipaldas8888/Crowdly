import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { Search, Bell, MessageSquare, LogOut } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link
            to="/home"
            className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight cursor-pointer"
          >
            Crowdly
          </Link>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Crowdly..."
              className="w-full bg-slate-100/80 border border-transparent rounded-full pl-10 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Right Section: User & Logout */}
        <div className="flex items-center gap-3">
          <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors hidden sm:block cursor-pointer">
            <MessageSquare className="w-4 h-4" />
          </button>
          <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors hidden sm:block cursor-pointer">
            <Bell className="w-4 h-4" />
          </button>

          <div className="h-5 w-[1px] bg-slate-200 hidden sm:block"></div>

          {/* User badge */}
          <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img
              src={
                user?.avatar ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
              }
              alt={user?.username || "User"}
              className="w-8 h-8 rounded-full object-cover border border-slate-200"
            />
            <span className="text-xs font-semibold text-slate-800 hidden sm:inline-block">
              {user?.username}
            </span>
          </Link>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ml-1"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
