"use client";

import { useState } from "react";
import Link from "@/components/ui/CustomLink";
import LineChart, { type LineSeries } from "./charts/LineChart";
import type { AuthorActivity, AuthorRange } from "@/utils/explorerStats";
import { useExplorerSection } from "./useExplorerSection";
import SectionError from "./SectionError";
import { ChartSkeleton, Skeleton, TableSkeleton } from "./Skeleton";
import { compact, usd } from "./format";

const RANGES: AuthorRange[] = ["6h", "24h"];
const RANGE_LABEL: Record<AuthorRange, string> = {
  "6h": "6 hours",
  "24h": "24 hours",
};

const th =
  "text-[10px] uppercase tracking-wider text-default-400 font-semibold text-left py-1.5";
const td = "py-2 text-xs border-t border-default-100 dark:border-default-100/30";

/**
 * Content tab — part 1: posts/comments per bucket + most active authors for
 * the selected window. Lazily fetched when the Content tab mounts.
 */
export default function ExplorerAuthorActivity() {
  const [range, setRange] = useState<AuthorRange>("24h");

  const { data, error, isLoading, retry } =
    useExplorerSection<AuthorActivity>(`authors&range=${range}`);

  const series: LineSeries[] = [
    {
      name: "Posts",
      color: "#3b82f6",
      points: (data?.buckets ?? []).map((b) => ({ x: b.t, y: b.posts })),
    },
    {
      name: "Comments",
      color: "#f59e0b",
      points: (data?.buckets ?? []).map((b) => ({ x: b.t, y: b.comments })),
    },
  ];

  const totals = data?.totals;
  const coveredHours =
    totals && data ? Math.round((data.to - totals.oldestCovered) / 3600) : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-default-100/70 dark:bg-content1/40">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              aria-pressed={range === r}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                range === r
                  ? "bg-primary text-white shadow-sm"
                  : "text-default-500 hover:text-foreground"
              }`}
            >
              Last {RANGE_LABEL[r]}
            </button>
          ))}
        </div>
        {isLoading ? (
          <div className="flex items-center gap-3">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-14" />
          </div>
        ) : totals ? (
          <div className="flex items-center gap-4 text-xs">
            <span className="text-default-500">
              Posts <b className="font-mono text-foreground">{compact(totals.posts)}</b>
            </span>
            <span className="text-default-500">
              Comments{" "}
              <b className="font-mono text-foreground">{compact(totals.comments)}</b>
            </span>
            <span className="text-default-500">
              Authors{" "}
              <b className="font-mono text-foreground">
                {compact(totals.uniqueAuthors)}
              </b>
            </span>
            <span className="text-default-500">
              Payouts <b className="font-mono text-foreground">{usd(totals.payout)}</b>
            </span>
          </div>
        ) : null}
      </div>

      {error ? (
        <SectionError
          onRetry={retry}
          message="Content statistics failed to load for this window."
        />
      ) : (
        <>
          {isLoading ? (
            <ChartSkeleton height={240} />
          ) : (
            <LineChart
              series={series}
              height={240}
              yFormat="int"
              emptyText="No content in window"
            />
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold">Most active authors</h3>
              <span className="text-[11px] text-default-400">
                {isLoading
                  ? "Loading…"
                  : coveredHours > 0
                    ? `covering last ${coveredHours}h of content`
                    : ""}
              </span>
            </div>
            {isLoading ? (
              <TableSkeleton rows={8} />
            ) : (
              <div className="overflow-x-auto -mx-1 px-1">
                <table className="w-full min-w-[480px]">
                  <thead>
                    <tr>
                      <th className={th}>#</th>
                      <th className={th}>Author</th>
                      <th className={`${th} text-right`}>Posts</th>
                      <th className={`${th} text-right`}>Comments</th>
                      <th className={`${th} text-right`}>Total</th>
                      <th className={`${th} text-right`}>Payouts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.topAuthors ?? []).slice(0, 15).map((a, i) => (
                      <tr key={a.author}>
                        <td className={`${td} font-mono text-default-400`}>{i + 1}</td>
                        <td className={td}>
                          <Link
                            href={`/@${a.author}`}
                            className="font-semibold text-primary hover:underline"
                          >
                            {a.author}
                          </Link>
                        </td>
                        <td className={`${td} text-right font-mono`}>{a.posts}</td>
                        <td className={`${td} text-right font-mono`}>{a.comments}</td>
                        <td className={`${td} text-right font-mono font-bold`}>
                          {a.total}
                        </td>
                        <td className={`${td} text-right font-mono`}>{usd(a.payout)}</td>
                      </tr>
                    ))}
                    {(data?.topAuthors?.length ?? 0) === 0 ? (
                      <tr>
                        <td className={`${td} text-default-400`} colSpan={6}>
                          No content found in this window
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
