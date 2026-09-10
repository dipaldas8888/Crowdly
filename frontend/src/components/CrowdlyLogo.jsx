import { Link } from "react-router-dom";

export default function CrowdlyLogo({
  size = "md",
  showText = true,
  lightText = false,
  to = "/home",
  className = "",
}) {
  const sizeMap = {
    sm: { box: "w-8 h-8", img: "w-8 h-8", text: "text-lg" },
    md: { box: "w-9 h-9 sm:w-10 sm:h-10", img: "w-9 h-9 sm:w-10 sm:h-10", text: "text-xl sm:text-2xl" },
    lg: { box: "w-11 h-11 sm:w-12 sm:h-12", img: "w-11 h-11 sm:w-12 sm:h-12", text: "text-2xl sm:text-3xl" },
    xl: { box: "w-14 h-14 sm:w-16 sm:h-16", img: "w-14 h-14 sm:w-16 sm:h-16", text: "text-3xl sm:text-4xl" },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const content = (
    <div className={`flex items-center gap-2.5 group cursor-pointer ${className}`}>
      {/* 3D Glassmorphic App Icon Badge */}
      <div className={`relative ${currentSize.box} rounded-2xl overflow-hidden shadow-md shadow-blue-500/20 group-hover:scale-105 group-hover:shadow-blue-500/30 transition-all shrink-0 border border-white/20 bg-gradient-to-tr from-blue-600 to-indigo-600`}>
        <img
          src="/logo-icon.png"
          alt="Crowdly Emblem"
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback if image fails
            e.target.style.display = "none";
          }}
        />
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="hidden xs:flex items-baseline leading-none select-none">
          <span
            className={`font-black tracking-tight transition-colors ${
              lightText
                ? "text-white group-hover:text-blue-100"
                : "text-blue-600 group-hover:text-blue-700"
            } ${currentSize.text}`}
          >
            Crowdly
          </span>
          <span className={`font-black text-amber-500 ${currentSize.text}`}>.</span>
        </div>
      )}
    </div>
  );

  if (to) {
    return <Link to={to}>{content}</Link>;
  }

  return content;
}
