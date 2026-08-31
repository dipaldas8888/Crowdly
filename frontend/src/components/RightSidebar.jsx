import { useState } from "react";

export default function RightSidebar() {
  const [suggestions, setSuggestions] = useState([
    {
      id: 1,
      name: "Emery Farley",
      avatar:
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80",
    },
    {
      id: 2,
      name: "Alice Wells",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
    },
  ]);

  const activities = [
    {
      id: 1,
      name: "Andrea",
      action: "changed their cover picture.",
      time: "1 min ago",
      avatar:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80",
    },
    {
      id: 2,
      name: "Leland Walker",
      action: "liked a post.",
      time: "1 min ago",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    },
    {
      id: 3,
      name: "Drew Williamson",
      action: "liked a comment.",
      time: "1 min ago",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
    },
    {
      id: 4,
      name: "Ivory Landry",
      action: "posted a new photo.",
      time: "1 min ago",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80",
    },
  ];

  const onlineFriends = [
    {
      id: 1,
      name: "Collins Fischer",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
    },
    {
      id: 2,
      name: "Christena Mills",
      avatar:
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&q=80",
    },
    {
      id: 3,
      name: "Lindsey Davidson",
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80",
    },
    {
      id: 4,
      name: "Leana Frazier",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
    },
    {
      id: 5,
      name: "Walker Curry",
      avatar:
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80",
    },
  ];

  const handleDismiss = (id) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleFollow = (id) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <aside className="w-80 shrink-0 hidden lg:block sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto p-4 space-y-4 scrollbar-thin">
      {/* Suggestions For You */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Suggestions For You
        </h3>
        <div className="space-y-3">
          {suggestions.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No new suggestions</p>
          ) : (
            suggestions.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-100"
                  />
                  <span className="text-xs font-semibold text-slate-800 truncate">
                    {user.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleFollow(user.id)}
                    className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md transition-all shadow-xs cursor-pointer"
                  >
                    follow
                  </button>
                  <button
                    onClick={() => handleDismiss(user.id)}
                    className="bg-rose-500 hover:bg-rose-600 active:scale-95 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md transition-all shadow-xs cursor-pointer"
                  >
                    dismiss
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Latest Activities */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Latest Activities
        </h3>
        <div className="space-y-3.5">
          {activities.map((act) => (
            <div key={act.id} className="flex items-start gap-2.5 text-xs">
              <img
                src={act.avatar}
                alt={act.name}
                className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-100 mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <p className="text-slate-700 leading-snug">
                  <span className="font-semibold text-slate-900">
                    {act.name}
                  </span>{" "}
                  {act.action}
                </p>
              </div>
              <span className="text-[10px] text-slate-400 shrink-0 whitespace-nowrap pt-0.5">
                {act.time}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Online Friends */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Online Friends
        </h3>
        <div className="space-y-2.5">
          {onlineFriends.map((friend) => (
            <div
              key={friend.id}
              className="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div className="relative shrink-0">
                <img
                  src={friend.avatar}
                  alt={friend.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-100"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
              </div>
              <span className="text-xs font-medium text-slate-800 truncate">
                {friend.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
