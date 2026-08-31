import { useAuth } from "../context/AuthContext";
import { Plus } from "lucide-react";

export default function Stories() {
  const { user } = useAuth();

  const stories = [
    {
      id: 1,
      name: user?.username || "John Doe",
      image:
        user?.avatar ||
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
      isUser: true,
    },
    {
      id: 2,
      name: "Eveline Baker",
      image:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      isUser: false,
    },
    {
      id: 3,
      name: "Jesse George",
      image:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
      isUser: false,
    },
    {
      id: 4,
      name: "Turner Paul",
      image:
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80",
      isUser: false,
    },
    {
      id: 5,
      name: "Marie Riddle",
      image:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
      isUser: false,
    },
  ];

  return (
    <div className="grid grid-cols-5 gap-2.5 sm:gap-3 mb-6">
      {stories.map((story) => (
        <div
          key={story.id}
          className="relative h-44 sm:h-52 rounded-2xl overflow-hidden cursor-pointer group shadow-xs hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
        >
          {/* Background Cover Image */}
          <img
            src={story.image}
            alt={story.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Dark Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

          {/* User Add Badge or Story Content */}
          {story.isUser ? (
            <div className="absolute bottom-3 left-3 right-3 flex flex-col items-start gap-1">
              <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white border-2 border-white shadow-md mb-0.5">
                <Plus className="w-4 h-4 stroke-[3]" />
              </div>
              <span className="text-xs font-semibold text-white truncate max-w-full drop-shadow-md">
                {story.name}
              </span>
            </div>
          ) : (
            <div className="absolute bottom-3 left-3 right-3">
              <span className="text-xs font-semibold text-white truncate block drop-shadow-md">
                {story.name}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
