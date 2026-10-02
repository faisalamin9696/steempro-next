/**
 * Shimmer skeleton primitives for the explorer's per-card loading states.
 * Plain divs — safe to render from either server or client trees.
 */

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-lg bg-default-200/60 dark:bg-default-100/10 ${className}`}
    />
  );
}

/** One KPI stat card placeholder (icon chip + two text lines). */
export function StatSkeleton() {
  return (
    <div className="rounded-xl border border-default-200/60 dark:border-default-100/40 bg-white/60 dark:bg-content1/30 p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-2.5 w-20" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
    </div>
  );
}

/** Grid of stat-card skeletons matching the final layout. */
export function StatGridSkeleton({
  count = 6,
  className = "grid grid-cols-2 lg:grid-cols-3 gap-3",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={className} aria-busy>
      {Array.from({ length: count }, (_, i) => (
        <StatSkeleton key={i} />
      ))}
    </div>
  );
}

/** Chart-card placeholder: title bar + shimmering plot area. */
export function ChartSkeleton({ height = 260 }: { height?: number }) {
  return (
    <div className="rounded-xl border border-default-200/60 dark:border-default-100/40 bg-white/60 dark:bg-content1/30 p-4">
      <Skeleton className="h-4 w-36 mb-3" />
      <div
        style={{ height }}
        className="w-full rounded-lg animate-pulse bg-default-200/60 dark:bg-default-100/10"
        aria-hidden
      />
    </div>
  );
}

/** Data-table placeholder: header line + N body rows. */
export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-default-200/60 dark:border-default-100/40 bg-white/60 dark:bg-content1/30 p-4">
      <Skeleton className="h-4 w-32 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-3 w-6" />
            <Skeleton className="h-3 flex-1 max-w-[40%]" />
            <Skeleton className="h-3 w-16 ml-auto" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Label/value definition-list placeholder (chain parameters). */
export function RowListSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-3.5" aria-busy>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
}
