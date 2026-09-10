import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { X, PenSquare, ImagePlus, Users, Video, ArrowRight, Sparkles } from "lucide-react";

export default function CreatePortalModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const createActions = [
    {
      title: "Create Post",
      description: "Share photos, thoughts, or updates with your feed",
      icon: PenSquare,
      color: "bg-blue-500 text-white shadow-blue-500/20",
      bgHover: "hover:border-blue-300 hover:bg-blue-50/50",
      action: () => {
        onClose();
        navigate("/home");
      },
    },
    {
      title: "Add Story",
      description: "Publish a 24-hour photo or video story",
      icon: ImagePlus,
      color: "bg-pink-500 text-white shadow-pink-500/20",
      bgHover: "hover:border-pink-300 hover:bg-pink-50/50",
      action: () => {
        onClose();
        navigate("/home");
      },
    },
    {
      title: "Create Group",
      description: "Start a new community or discussion hub",
      icon: Users,
      color: "bg-emerald-500 text-white shadow-emerald-500/20",
      bgHover: "hover:border-emerald-300 hover:bg-emerald-50/50",
      action: () => {
        onClose();
        navigate("/groups");
      },
    },
    {
      title: "Upload Video",
      description: "Share videos to the Crowdly Watch feed",
      icon: Video,
      color: "bg-purple-500 text-white shadow-purple-500/20",
      bgHover: "hover:border-purple-300 hover:bg-purple-50/50",
      action: () => {
        onClose();
        navigate("/watch");
      },
    },
  ];

  return createPortal(
    <div className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-100 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Create Portal</h3>
              <p className="text-xs font-semibold text-slate-400">What would you like to create today?</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {createActions.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                onClick={item.action}
                className={`p-4 rounded-2xl border border-slate-200/80 ${item.bgHover} cursor-pointer transition-all duration-200 group flex flex-col justify-between space-y-3 shadow-xs hover:shadow-md hover:-translate-y-0.5`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
          >
            Close Portal
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
