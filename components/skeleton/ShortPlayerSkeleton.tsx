function ShortPlayerSkeleton() {
  return (
    <div className="h-[calc(100vh-64px)] w-full flex flex-col md:py-2 md:flex-row md:flex-nowrap md:items-end md:justify-center md:gap-4 md:px-4 md:pb-4 animate-pulse">
      {/* 1. Left Sidebar (XL Only): Identity Placeholder */}
      <div className="hidden xl:flex shrink-0 flex-col items-start justify-end h-full w-[240px] gap-4 pb-12">
        <div className="bg-zinc-800/20 backdrop-blur-md rounded-2xl border border-white/5 p-4 w-full space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-zinc-800/80 rounded-full" />
             <div className="space-y-2">
                <div className="h-4 bg-zinc-800/80 rounded w-24" />
                <div className="h-3 bg-zinc-800/60 rounded w-16" />
             </div>
          </div>
          <div className="space-y-2">
             <div className="h-5 bg-zinc-800/80 rounded w-3/4" />
             <div className="flex gap-2">
                <div className="h-4 bg-zinc-800/40 rounded-full w-12" />
                <div className="h-4 bg-zinc-800/40 rounded-full w-14" />
             </div>
          </div>
        </div>
      </div>

      {/* 2. Center Stage: Video Canvas Placeholder */}
      <div className="flex-1 h-full w-full md:max-w-[500px] md:rounded-2xl bg-zinc-900 group relative flex items-center justify-center overflow-hidden shadow-2xl border border-white/5">
        
        {/* MOBILE ONLY Overlay Info (Hidden on XL) */}
        <div className="absolute inset-x-0 bottom-0 pointer-events-none xl:hidden">
          <div className="absolute bottom-0 inset-x-0 h-48 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
          <div className="relative p-6 pt-20 pb-10 flex flex-col gap-3">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-800/80 rounded-full" />
                <div className="h-4 bg-zinc-800/80 rounded w-28" />
             </div>
             <div className="h-5 bg-zinc-800/80 rounded w-3/4" />
          </div>
        </div>

        {/* MOBILE ONLY Actions (Hidden on MD) */}
        <div className="absolute bottom-20 right-2 z-20 flex flex-col gap-6 items-center md:hidden">
          <div className="w-11 h-11 bg-zinc-800/80 rounded-full shadow-lg" />
          <div className="w-11 h-11 bg-zinc-800/80 rounded-full shadow-lg" />
          <div className="w-11 h-11 bg-zinc-800/80 rounded-full shadow-lg" />
        </div>

        {/* Progress Bar placeholder */}
        <div className="absolute bottom-2 left-3 right-3 z-40 h-1 bg-white/10 rounded-full" />
      </div>

      {/* 3. Right Sidebar (MD Only): Actions Placeholder */}
      <div className="hidden md:flex flex-col items-center justify-end h-full w-16 gap-6 pb-12">
        <div className="flex flex-col items-center gap-6 rounded-full">
           <div className="space-y-1.5 flex flex-col items-center">
             <div className="w-11 h-11 bg-zinc-800/80 rounded-full shadow-lg" />
             <div className="w-6 h-3 bg-zinc-800/40 rounded" />
           </div>
           
           <div className="space-y-1.5 flex flex-col items-center">
             <div className="w-11 h-11 bg-zinc-800/80 rounded-full shadow-lg" />
             <div className="w-6 h-3 bg-zinc-800/40 rounded" />
           </div>

           <div className="w-11 h-11 bg-zinc-800/80 rounded-full shadow-lg" />
           <div className="w-11 h-11 bg-zinc-800/80 rounded-full shadow-lg" />
        </div>
      </div>
    </div>
  );
}

export default ShortPlayerSkeleton;
