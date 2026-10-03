"use client";

import Link from "@/components/ui/CustomLink";
import { compact } from "../format";

/**
 * Dependency-free horizontal bar chart (divs + Tailwind) for categorical
 * explorer stats: operation counts, tag usage, etc.
 *
 * Interactive: hovering a row highlights it and shows the exact value plus
 * its share of the total (the inline label is compacted); rows carrying an
 * `href` stay clickable.
 */

export interface BarDatum {
  label: string;
  value: number;
  href?: string;
  hint?: string;
}

interface BarChartProps {
  data: BarDatum[];
  color?: string;
  /** Log scale — needed for op/tag counts that span several magnitudes. */
  log?: boolean;
  maxBars?: number;
}

export default function BarChart({
  data,
  color = "bg-primary",
  log = false,
  maxBars,
}: BarChartProps) {
  const rows = (maxBars ? data.slice(0, maxBars) : data).filter(
    (d) => d.value > 0,
  );
  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-sm text-default-400">
        No data available
      </div>
    );
  }

  const transform = (v: number) => (log ? Math.log10(v + 1) : v);
  const maxValue = Math.max(...rows.map((d) => transform(d.value)));
  const total = rows.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-1.5">
      {rows.map((d, i) => {
        const width = Math.max(1.5, (transform(d.value) / maxValue) * 100);
        const share = total > 0 ? (d.value / total) * 100 : 0;
        // Rows 2+ open upward (into the rows above). Row 1 has nothing above
        // it but the chart's own heading, so it opens downward instead —
        // otherwise the tooltip hides the subtitle it sits on top of.
        const tipAnchor = i === 0 ? "top-full mt-1" : "bottom-full mb-1";
        const inner = (
          <div className="group/row relative flex items-center gap-3 min-w-0 rounded-md px-1 -mx-1 transition-colors hover:bg-default-100/70 dark:hover:bg-default-100/10">
            <span
              className="w-28 sm:w-36 shrink-0 truncate text-xs font-semibold text-default-600 dark:text-default-400"
              title={d.hint ?? d.label}
            >
              {d.label}
            </span>
            <div className="flex-1 min-w-0 h-5 rounded-md bg-default-100/70 dark:bg-default-100/10 overflow-hidden">
              <div
                className={`h-full rounded-md ${color} transition-all duration-500 group-hover/row:brightness-110`}
                style={{ width: `${width}%` }}
              />
            </div>
            <span className="w-16 sm:w-20 shrink-0 text-right text-xs font-mono font-bold text-foreground">
              {compact(d.value)}
            </span>

            {/* exact value + share — the inline label is compacted, so hover
                reveals the unabbreviated number. Pointer-events stay off so
                the row (which may be a link) keeps working underneath. */}
            <span className={`pointer-events-none absolute ${tipAnchor} left-10 hidden group-hover/row:block whitespace-nowrap rounded-md border border-default-200/60 dark:border-divider bg-content1 px-2 py-1 text-[11px] font-semibold shadow-lg z-10`}>
              <span className="font-mono tabular-nums">
                {d.value.toLocaleString()}
              </span>
              {/* default-700 is the only shade that clears 4.5:1 on the
                  tooltip surface in both themes (HeroUI inverts default-* in
                  dark mode) — 500 lands at ~2.4:1. */}
              <span className="text-default-700 font-normal">
                {" · "}
                {share.toFixed(1)}%
              </span>
            </span>
          </div>
        );
        return d.href ? (
          <Link
            key={d.label}
            href={d.href}
            className="block hover:opacity-80 transition-opacity"
          >
            {inner}
          </Link>
        ) : (
          <div key={d.label}>{inner}</div>
        );
      })}
    </div>
  );
}
