import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  build: {
    // Raise the warning threshold (pages like MessagesPage are legitimately large)
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        /**
         * Manual chunk splitting strategy:
         *
         *  vendor-react   → react, react-dom, react-router-dom  (rarely changes, long-term cache)
         *  vendor-ui      → @mui/material + @emotion (large but stable)
         *  vendor-socket  → socket.io-client (isolated so it never busts page caches)
         *  vendor-utils   → toast, lucide-react, other small utilities
         *
         * Pages are automatically split into their own chunks by React.lazy().
         */
        manualChunks(id) {
          // ── React core ──────────────────────────────────────────────────
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/react-router") ||
            id.includes("node_modules/react-router-dom/")
          ) {
            return "vendor-react";
          }

          // ── MUI + Emotion ────────────────────────────────────────────────
          if (
            id.includes("node_modules/@mui/") ||
            id.includes("node_modules/@emotion/")
          ) {
            return "vendor-ui";
          }

          // ── Socket.IO ────────────────────────────────────────────────────
          if (id.includes("node_modules/socket.io-client/")) {
            return "vendor-socket";
          }

          // ── Lucide icons ─────────────────────────────────────────────────
          if (id.includes("node_modules/lucide-react/")) {
            return "vendor-icons";
          }

          // ── Remaining node_modules → vendor-utils ────────────────────────
          if (id.includes("node_modules/")) {
            return "vendor-utils";
          }
        },
      },
    },
  },

  // Pre-bundle heavy deps for faster dev server cold-start
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "socket.io-client",
      "lucide-react",
      "react-toastify",
    ],
  },
});
