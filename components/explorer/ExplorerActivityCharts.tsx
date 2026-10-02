"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "@/components/ui/CustomLink";
import { ArrowUpRight } from "lucide-react";
import LineChart, { type LineSeries } from "./charts/LineChart";
import { sdsApi } from "@/libs/sds";
import { summarizeMarket, type MarketBucket } from "@/utils/marketSummary";
import ExplorerMarketSummary from "./ExplorerMarketSummary";
import { useExplorerSection } from "./useExplorerSection";
import SectionError from "./SectionError";
import { ChartSkeleton, StatGridSkeleton } from "./Skeleton";

type Range = "24h" | "7d" | "30d";

const RANGES: Range[] = ["24h", "7d", "30d"];
const RANGE_LABEL: Record<Range, string> = {
  "24h": "24h",
  "7d": "7d",
  "30d": "30d",
};
const MARKET_HOURS: Record<Range, number> = { "24h": 24, "7d": 168, "30d": 720 };
const MARKET_BUCKET: Record<Range, number> = {
  "24h": 3600,
  "7d": 21600,
  "30d": 86400,
};

interface ActivityResponse {
  range: Range;
  series: Array<{ t: number; block: number; trx: number; ops: number }>;
}

/**
 * Activity tab: network-activity + STEEM price charts with a time-frame
 * switch, topped by range-aware market summary cards derived from the very
 * same buckets the price chart plots (so numbers and chart always agree).
 *
 * Everything here loads lazily when the tab is first selected.
 */
export default function ExplorerActivityCharts() {
  const [range, setRange] = useState<Range>("24h");

  const activity = useExplorerSection<ActivityResponse>(`activity&range=${range}`);

  const market = useSWR<MarketBucket[]>(
    ["explorer-market", range],
    ([, r]) =>
      sdsApi.getMarketHistory(MARKET_BUCKET[r as Range], MARKET_HOURS[r as Range]),
    { revalidateOnFocus: false, shouldRetryOnError: false },
  );

  const samples = activity.data?.series ?? [];
  const avgTrx = samples.length
    ? samples.reduce((s, p) => s + p.trx, 0) / samples.length
    : 0;
  const avgOps = samples.length
    ? samples.reduce((s, p) => s + p.ops, 0) / samples.length
    : 0;

  const summary = market.data
    ? summarizeMarket(market.data, MARKET_HOURS[range])
    : null;

  const activitySeries: LineSeries[] = [
    {
      name: "Transactions / block",
      color: "#3b82f6",
      points: samples.map((p) => ({ x: p.t, y: p.trx })),
    },
    {
      name: "Operations / block",
      color: "#8b5cf6",
      points: samples.map((p) => ({ x: p.t, y: p.ops })),
    },
  ];

  const pricePoints =
    market.data
      ?.filter((m) => (m.close_steem ?? 0) > 0 && (m.close_sbd ?? 0) > 0)
      .map((m) => ({
        x: m.time,
        y: (m.close_sbd as number) / (m.close_steem as number),
      })) ?? [];

  const changePct = summary?.changePct ?? 0;
  const priceSeries: LineSeries[] = [
    {
      name: "STEEM / SBD",
      color: changePct >= 0 ? "#10b981" : "#f43f5e",
      points: pricePoints,
    },
  ];

  return (
    <div className="space-y-4">
      {/* time-frame switch + per-block averages */}
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
              {RANGE_LABEL[r]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-default-500">
            Avg trx/block{" "}
            <b className="font-mono text-foreground">
              {activity.isLoading ? "…" : avgTrx ? avgTrx.toFixed(1) : "—"}
            </b>
          </span>
          <span className="text-default-500">
            Avg ops/block{" "}
            <b className="font-mono text-foreground">
              {activity.isLoading ? "…" : avgOps ? avgOps.toFixed(1) : "—"}
            </b>
          </span>
        </div>
      </div>

      {/* range-aware market summary cards */}
      {market.error ? (
        <SectionError
          onRetry={() => void market.mutate()}
          message="Market history is unavailable right now."
        />
      ) : market.isLoading ? (
        <StatGridSkeleton count={6} className="grid grid-cols-2 lg:grid-cols-3 gap-3" />
      ) : (
        <ExplorerMarketSummary summary={summary} windowLabel={RANGE_LABEL[range]} />
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* network activity */}
        <div className="rounded-xl border border-default-200/60 dark:border-default-100/40 bg-white/60 dark:bg-content1/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold">Network activity</h3>
              <p className="text-[11px] text-default-400">
                {activity.isLoading
                  ? "Sampling blocks…"
                  : activity.error
                    ? "Unavailable"
                    : `${samples.length} blocks sampled`}
              </p>
            </div>
          </div>
          {activity.error ? (
            <SectionError
              onRetry={activity.retry}
              message="Block sampling failed for this time frame."
            />
          ) : activity.isLoading ? (
            <ChartSkeleton height={260} />
          ) : (
            <LineChart
              series={activitySeries}
              height={260}
              yFormat="int"
              emptyText="No activity samples yet"
            />
          )}
        </div>

        {/* price */}
        <div className="rounded-xl border border-default-200/60 dark:border-default-100/40 bg-white/60 dark:bg-content1/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold">STEEM price</h3>
              <p className="text-[11px] text-default-400">
                Internal market · last {RANGE_LABEL[range]}
              </p>
            </div>
            {summary ? (
              <div className="text-right">
                <div className="text-sm font-mono font-bold">
                  ${summary.price.toFixed(4)}
                </div>
                <div
                  className={`text-[11px] font-mono font-bold ${
                    changePct >= 0 ? "text-success" : "text-danger"
                  }`}
                >
                  {changePct >= 0 ? "+" : ""}
                  {changePct.toFixed(2)}%
                </div>
              </div>
            ) : null}
          </div>
          {market.error ? (
            <SectionError
              onRetry={() => void market.mutate()}
              message="Market history is unavailable right now."
            />
          ) : market.isLoading ? (
            <ChartSkeleton height={260} />
          ) : (
            <LineChart
              series={priceSeries}
              height={260}
              yFormat="usd"
              emptyText="No market trades in this window"
            />
          )}
          <div className="mt-2 text-right">
            <Link
              href="/market"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
            >
              Full market view <ArrowUpRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
