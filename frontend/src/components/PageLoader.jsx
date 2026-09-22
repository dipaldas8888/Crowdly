// ─── Branded splash loader shown while auth check is in flight ───
export default function PageLoader() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
        background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        zIndex: 9998,
      }}
    >
      {/* Logo badge */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 22,
          background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 40px rgba(124,58,237,0.5), 0 0 80px rgba(79,70,229,0.3)",
          animation: "crowdly-pulse 2s ease-in-out infinite",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width={48}
          height={48}
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="8" r="3" />
          <circle cx="5" cy="16" r="2.5" />
          <circle cx="19" cy="16" r="2.5" />
          <line x1="12" y1="11" x2="5" y2="13.5" />
          <line x1="12" y1="11" x2="19" y2="13.5" />
        </svg>
      </div>

      {/* Brand name */}
      <span
        style={{
          fontFamily: "'Poppins', 'Segoe UI', sans-serif",
          fontSize: "2rem",
          fontWeight: 800,
          letterSpacing: "-0.5px",
          background: "linear-gradient(90deg, #a78bfa, #60a5fa, #a78bfa)",
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          animation: "crowdly-shimmer 2s linear infinite",
        }}
      >
        Crowdly
      </span>

      {/* Loading dots */}
      <div style={{ display: "flex", gap: 8 }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: i === 0 ? "#7c3aed" : i === 1 ? "#4f46e5" : "#60a5fa",
              display: "block",
              animation: `crowdly-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes crowdly-pulse {
          0%, 100% { box-shadow: 0 0 40px rgba(124,58,237,0.5), 0 0 80px rgba(79,70,229,0.3); }
          50%       { box-shadow: 0 0 60px rgba(124,58,237,0.8), 0 0 120px rgba(79,70,229,0.5); }
        }
        @keyframes crowdly-shimmer {
          0%   { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes crowdly-bounce {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
          40%            { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
