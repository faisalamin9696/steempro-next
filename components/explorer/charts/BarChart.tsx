"use client";

import { compact } from "../format";

/**
 * Dependency-free horizontal bar chart (divs + Tailwind) for categorical
 * explorer stats: operation counts, tag usage, etc.
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

  return (
    <div className="space-y-1.5">
      {rows.map((d) => {
        const width = Math.max(1.5, (transform(d.value) / maxValue) * 100);
        const inner = (
          <div className="flex items-center gap-3 min-w-0">
            <span
              className="w-28 sm:w-36 shrink-0 truncate text-xs font-semibold text-default-600 dark:text-default-400"
              title={d.hint ?? d.label}
            >
              {d.label}
            </span>
            <div className="flex-1 min-w-0 h-5 rounded-md bg-default-100/70 dark:bg-default-100/10 overflow-hidden">
              <div
                className={`h-full rounded-md ${color} transition-all duration-500`}
                style={{ width: `${width}%` }}
              />
            </div>
            <span className="w-16 sm:w-20 shrink-0 text-right text-xs font-mono font-bold text-foreground">
              {compact(d.value)}
            </span>
          </div>
        );
        return d.href ? (
          <a
            key={d.label}
            href={d.href}
            className="block hover:opacity-80 transition-opacity"
          >
            {inner}
          </a>
        ) : (
          <div key={d.label}>{inner}</div>
        );
      })}
    </div>
  );
}
