// ─── Page-level Skeleton Loader shown while lazy chunks load ───
export default function PageLoader() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col animate-pulse">
      {/* Navbar skeleton */}
      <div className="h-14 bg-white border-b border-slate-200 flex items-center px-6 gap-4 sticky top-0 z-50 shadow-xs">
        <div className="w-9 h-9 rounded-xl bg-slate-200" />
        <div className="w-24 h-5 rounded-full bg-slate-200 hidden sm:block" />
        <div className="flex-1" />
        <div className="w-8 h-8 rounded-full bg-slate-200" />
        <div className="w-8 h-8 rounded-full bg-slate-200" />
        <div className="w-9 h-9 rounded-full bg-slate-200" />
      </div>

      {/* Body skeleton */}
      <div className="flex flex-1 max-w-[1600px] mx-auto w-full">
        {/* Left sidebar skeleton */}
        <div className="w-60 shrink-0 hidden md:block p-4 space-y-3 bg-white border-r border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-slate-200" />
            <div className="w-28 h-4 rounded-full bg-slate-200" />
          </div>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-slate-200" />
              <div className="w-20 h-3.5 rounded-full bg-slate-200" />
            </div>
          ))}
        </div>

        {/* Main content skeleton */}
        <main className="flex-1 px-4 md:px-8 py-6 space-y-4 max-w-3xl mx-auto w-full">
          {/* Create post */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 h-20" />

          {/* Post cards */}
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="w-32 h-3.5 rounded-full bg-slate-200" />
                  <div className="w-20 h-3 rounded-full bg-slate-200" />
                </div>
              </div>
              <div className="h-48 bg-slate-200" />
              <div className="p-4 space-y-2">
                <div className="w-full h-3 rounded-full bg-slate-200" />
                <div className="w-3/4 h-3 rounded-full bg-slate-200" />
              </div>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}
