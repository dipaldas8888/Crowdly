// ─── Branded Dark Splash Screen — ONLY shown on fresh app start (no session) ───
export default function AppSplash() {
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
        zIndex: 9999,
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
        }}
      >
        Crowdly
      </span>

      {/* Animated dots */}
      <div style={{ display: "flex", gap: "8px" }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: "#7c3aed",
            animation: "crowdly-bounce 1.2s ease-in-out infinite",
          }}
        />
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: "#4f46e5",
            animation: "crowdly-bounce 1.2s ease-in-out 0.2s infinite",
          }}
        />
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: "#60a5fa",
            animation: "crowdly-bounce 1.2s ease-in-out 0.4s infinite",
          }}
        />
      </div>

      <style>{`
        @keyframes crowdly-pulse {
          0%, 100% { boxShadow: 0 0 40px rgba(124,58,237,0.5), 0 0 80px rgba(79,70,229,0.3); }
          50% { boxShadow: 0 0 60px rgba(124,58,237,0.8), 0 0 120px rgba(79,70,229,0.5); }
        }
        @keyframes crowdly-bounce {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
          40% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
