"use client";

import { CalendarDays, UserPlus, Users } from "lucide-react";
import type { StatisticsResponse } from "@/utils/explorerStats";
import { useExplorerSection } from "./useExplorerSection";
import SectionError from "./SectionError";
import { ChartSkeleton, StatGridSkeleton } from "./Skeleton";
import ExplorerOperations from "./ExplorerOperations";
import StatCard from "./StatCard";
import LineChart, { type LineSeries } from "./charts/LineChart";
import BarChart from "./charts/BarChart";
import { compact, full } from "./format";

/**
 * Statistics tab: account growth (exact rolling-window counts + per-day
 * chart), the 90-day reward share rate, and the lifetime operation
 * distribution. Fetched as one section request on first activation.
 */
export default function ExplorerStatistics() {
  const { data, error, isLoading, retry } =
    useExplorerSection<StatisticsResponse>("statistics");

  if (error) {
    return <SectionError onRetry={retry} message="Statistics failed to load." />;
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <StatGridSkeleton count={3} />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <ChartSkeleton height={300} />
          <ChartSkeleton height={300} />
        </div>
        <div className="rounded-xl border border-default-200/60 dark:border-default-100/40 bg-white/60 dark:bg-content1/30 p-4">
          <div className="space-y-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-3 w-28 rounded bg-default-200/60 dark:bg-default-100/10 animate-pulse" />
                <div className="h-3 flex-1 rounded bg-default-200/60 dark:bg-default-100/10 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { ops, shareRates, growth } = data;
  const total14d = growth.perDay.reduce((sum, d) => sum + d.count, 0);
  const plus = growth.partial ? "+" : "";

  const shareSeries: LineSeries[] = [
    {
      name: "90-day reward share rate",
      color: "#f59e0b",
      points: shareRates.map((p) => ({ x: p.t, y: p.rate })),
    },
  ];

  return (
    <div className="space-y-6">
      {/* account growth KPIs */}
      <div>
        <StatCardGrid>
          <StatCard
            icon={UserPlus}
            label="New accounts · 24h"
            value={`${compact(growth.last24h)}${plus}`}
            title={full(growth.last24h)}
            sub="rolling window"
            tone="emerald"
          />
          <StatCard
            icon={Users}
            label="New accounts · 7d"
            value={`${compact(growth.last7d)}${plus}`}
            title={full(growth.last7d)}
            sub="rolling window"
            tone="blue"
          />
          <StatCard
            icon={CalendarDays}
            label={`New accounts · ${growth.perDay.length}d`}
            value={`${compact(total14d)}${plus}`}
            title={full(total14d)}
            sub="sum of daily bars below"
            tone="violet"
          />
        </StatCardGrid>
        <p className="text-[11px] text-default-400 mt-2">
          covering last {growth.coverageHours}h of registrations
          {growth.partial ? " · window partially covered — counts are lower bounds" : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* daily new accounts */}
        <div className="rounded-xl border border-default-200/60 dark:border-default-100/40 bg-white/60 dark:bg-content1/30 p-4">
          <div className="mb-3">
            <h3 className="text-sm font-bold">Account creation per day</h3>
            <p className="text-[11px] text-default-400">
              UTC days · last bucket is today so far
            </p>
          </div>
          <BarChart
            color="bg-emerald-500"
            data={growth.perDay.map((d) => ({
              label: new Date(d.t * 1000).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              }),
              value: d.count,
              hint: `${new Date(d.t * 1000).toDateString()} — ${full(d.count)} new accounts`,
            }))}
          />
        </div>

        {/* share rate */}
        <div className="rounded-xl border border-default-200/60 dark:border-default-100/40 bg-white/60 dark:bg-content1/30 p-4">
          <div className="mb-3">
            <h3 className="text-sm font-bold">Reward share rate</h3>
            <p className="text-[11px] text-default-400">
              90-day moving share rate of the reward pool
            </p>
          </div>
          <LineChart
            series={shareSeries}
            height={300}
            yFormat="rate"
            emptyText="No share-rate samples yet"
          />
        </div>
      </div>

      {/* operation distribution */}
      <div className="rounded-xl border border-default-200/60 dark:border-default-100/40 bg-white/60 dark:bg-content1/30 p-4">
        <div className="mb-3">
          <h3 className="text-sm font-bold">Operation distribution</h3>
          <p className="text-[11px] text-default-400">
            Lifetime operation counts across the whole chain · log scale
          </p>
        </div>
        <ExplorerOperations ops={ops} />
      </div>
    </div>
  );
}

/** Small helper so the KPI row keeps one shared grid definition. */
function StatCardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">{children}</div>
  );
}
