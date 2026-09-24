import { Loader2 } from "lucide-react";

// ─── Light-themed Page Loader / Skeleton ───
// Used for Suspense fallbacks & page content loading.
// Matches Crowdly's light design system (#f4f7fb) — NO dark splash flash!
export default function PageLoader() {
  return (
    <div className="min-h-screen bg-[#f4f7fb] flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3 bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-sm w-full text-center">
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 text-base">Loading content</h3>
          <p className="text-xs text-slate-500 mt-1">Please wait a moment...</p>
        </div>
      </div>
    </div>
  );
}
