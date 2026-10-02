"use client";

import SectionError from "@/components/explorer/SectionError";
import {
  ChartSkeleton,
  StatGridSkeleton,
} from "@/components/explorer/Skeleton";
import { compact, full, usd } from "@/components/explorer/format";
import LineChart, { type LineSeries } from "@/components/explorer/charts/LineChart";
import StatCard from "@/components/explorer/StatCard";
import ProgressDelta from "@/components/dashboard/ProgressDelta";
import Link from "@/components/ui/CustomLink";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Coins,
  FileText,
  MessageSquare,
  ThumbsUp,
  Type as TypeIcon,
  Wallet,
  Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import useSWR from "swr";
import type { AuthorStats, CommunityRange } from "@/utils/communityStats";

/**
 * "My Progress" — one author's own stats across all their content.
 *
 * Same panel language as the community Stats tab (shared labels, skeleton
 * states and charts) with previous-period delta chips on every KPI and
 * dashed prev-period chart overlays when the compare bundle is present.
 */

const CARD =
  "rounded-xl border border-default-200/60 dark:border-default-100/40 bg-white/60 dark:bg-content1/30 p-4";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res.json();
};

const RANGES: CommunityRange[] = ["7d", "30d", "90d"];

function UserStatsPanel({
  author,
  initialStats,
}: {
  author: string;
  initialStats?: AuthorStats;
}) {
  const t = useTranslations("Community.statsPanel");
  const td = useTranslations("Dashboard.delta");
  const tdash = useTranslations("Dashboard");
  const [range, setRange] = useState<CommunityRange>("7d");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const key = `/api/dashboard/author?author=${author}&range=${range}&compare=1`;

  const { data, error, isValidating, mutate } = useSWR<AuthorStats>(
    key,
    fetcher,
    {
      // Seed only the default range — a stale 7d bundle must never be shown
      // under a 30d/90d label while that range is loading.
      fallbackData: range === "7d" ? initialStats : undefined,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    },
  );

  const retry = () => void mutate();

  if (error && !data) {
    return <SectionError onRetry={retry} message={t("loadError")} />;
  }

  if (!data) {
    return (
      <div className="flex flex-col gap-4" aria-busy>
        <StatGridSkeleton
          count={8}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <ChartSkeleton height={240} />
          <ChartSkeleton height={240} />
          <ChartSkeleton height={240} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <ChartSkeleton height={200} />
          <ChartSkeleton height={200} />
        </div>
      </div>
    );
  }

  const { totals, series } = data;
  const cmp = data.compare;

  // overlay: shift prev-period points onto the current window so both
  // periods share one x-axis (dashed = previous, solid = current)
  const prevShift = cmp ? data.from - cmp.from : 0;
  const prevPts = (pick: (p: (typeof series)[number]) => number) =>
    (cmp?.series ?? []).map((p) => ({ x: p.t + prevShift, y: pick(p) }));

  const activitySeries: LineSeries[] = [
    {
      name: t("postsSeries"),
      color: "#3b82f6",
      points: series.map((p) => ({ x: p.t, y: p.posts })),
    },
    {
      name: t("commentsSeries"),
      color: "#8b5cf6",
      points: series.map((p) => ({ x: p.t, y: p.comments })),
    },
    ...(cmp
      ? [
          {
            name: `${t("postsSeries")} ${td("prev")}`,
            color: "#3b82f699",
            points: prevPts((p) => p.posts),
            dash: true,
          },
          {
            name: `${t("commentsSeries")} ${td("prev")}`,
            color: "#8b5cf699",
            points: prevPts((p) => p.comments),
            dash: true,
          },
        ]
      : []),
  ];
  const rewardsSeries: LineSeries[] = [
    {
      name: t("rewardsSeries"),
      color: "#10b981",
      points: series.map((p) => ({ x: p.t, y: Math.round(p.payout * 100) / 100 })),
    },
    ...(cmp
      ? [
          {
            name: `${t("rewardsSeries")} ${td("prev")}`,
            color: "#10b98199",
            points: prevPts((p) => Math.round(p.payout * 100) / 100),
            dash: true,
          },
        ]
      : []),
  ];
  const votesSeries: LineSeries[] = [
    {
      name: t("votesSeries"),
      color: "#f59e0b",
      points: series.map((p) => ({ x: p.t, y: p.votes })),
    },
    ...(cmp
      ? [
          {
            name: `${t("votesSeries")} ${td("prev")}`,
            color: "#f59e0b99",
            points: prevPts((p) => p.votes),
            dash: true,
          },
        ]
      : []),
  ];

  const rangeLabels: Record<CommunityRange, string> = {
    "7d": t("range7d"),
    "30d": t("range30d"),
    "90d": t("range90d"),
  };
  const deltaTitle = td("vsPrevious", { range: rangeLabels[range] });
  const chip = (current: number, previous: number) => (
    <ProgressDelta
      current={current}
      previous={previous}
      title={deltaTitle}
    />
  );

  const Chart = ({
    title,
    seriesToRender,
    yFormat,
  }: {
    title: string;
    seriesToRender: LineSeries[];
    yFormat: "int" | "usd0";
  }) => (
    <div className={CARD}>
      <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
        <BarChart3 size={16} className="text-primary" />
        {title}
      </h3>
      {mounted ? (
        <LineChart
          series={seriesToRender}
          height={240}
          yFormat={yFormat}
          emptyText={t("noData")}
        />
      ) : (
        <div
          aria-hidden
          style={{ height: 240 }}
          className="w-full rounded-lg animate-pulse bg-default-200/60 dark:bg-default-100/10"
        />
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* header: heading + partial notice + range switch */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Activity size={20} className="text-primary" />
            {tdash("myProgress")}
          </h2>
          <p className="text-xs text-default-400 mt-0.5">{tdash("myProgressSub")}</p>
          {totals.partial ? (
            <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 text-[11px] font-semibold">
              <AlertTriangle size={11} />
              {t("partial")}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {isValidating ? (
            <span className="text-xs text-default-400 animate-pulse">
              {t("updating")}
            </span>
          ) : null}
          <div className="flex gap-1 p-1 rounded-xl bg-default-100/70 dark:bg-default-100/20">
            {RANGES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                aria-pressed={range === r}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  range === r
                    ? "bg-primary text-white shadow-sm"
                    : "text-default-500 hover:text-foreground"
                }`}
              >
                {rangeLabels[r]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={FileText}
          tone="blue"
          label={t("posts")}
          value={full(totals.posts)}
          sub={t("postsSub")}
          delta={chip(totals.posts, cmp?.totals.posts ?? 0)}
        />
        <StatCard
          icon={MessageSquare}
          tone="violet"
          label={t("comments")}
          value={full(totals.comments)}
          sub={t("commentsSub")}
          delta={chip(totals.comments, cmp?.totals.comments ?? 0)}
        />
        <StatCard
          icon={Zap}
          tone="amber"
          label={t("engagementRate")}
          value={`${totals.engagementRate.toFixed(1)}×`}
          sub={t("engagementRateSub")}
          title={totals.engagementRate.toFixed(3)}
          delta={chip(totals.engagementRate, cmp?.totals.engagementRate ?? 0)}
        />
        <StatCard
          icon={Coins}
          tone="emerald"
          label={t("rewards")}
          value={usd(totals.rewards)}
          sub={t("rewardsSub")}
          title={totals.rewards.toFixed(2)}
          delta={chip(totals.rewards, cmp?.totals.rewards ?? 0)}
        />
        <StatCard
          icon={Wallet}
          tone="primary"
          label={t("avgPayout")}
          value={usd(totals.avgPostPayout)}
          sub={t("avgPayoutSub")}
          title={totals.avgPostPayout.toFixed(4)}
          delta={chip(totals.avgPostPayout, cmp?.totals.avgPostPayout ?? 0)}
        />
        <StatCard
          icon={ThumbsUp}
          tone="green"
          label={t("upvoteRatio")}
          value={`${(totals.upvoteRatio * 100).toFixed(0)}%`}
          sub={t("upvoteRatioSub")}
          title={totals.upvoteRatio.toFixed(4)}
          delta={chip(totals.upvoteRatio, cmp?.totals.upvoteRatio ?? 0)}
        />
        <StatCard
          icon={BarChart3}
          tone="sky"
          label={t("discussedPct")}
          value={`${(totals.discussedPct * 100).toFixed(0)}%`}
          delta={chip(totals.discussedPct, cmp?.totals.discussedPct ?? 0)}
        />
        <StatCard
          icon={TypeIcon}
          tone="rose"
          label={t("wordsTotal")}
          value={compact(totals.words)}
          title={full(totals.words)}
          delta={chip(totals.words, cmp?.totals.words ?? 0)}
        />
      </div>

      {/* charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Chart title={t("activityChart")} seriesToRender={activitySeries} yFormat="int" />
        <Chart title={t("rewardsChart")} seriesToRender={rewardsSeries} yFormat="usd0" />
        <Chart title={t("votesChart")} seriesToRender={votesSeries} yFormat="int" />
      </div>

      {/* top rewarded content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className={CARD}>
          <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
            <FileText size={16} className="text-blue-500" />
            {t("topPosts")}
          </h3>
          <p className="text-xs text-default-400 mb-2">{t("contentSub")}</p>
          {data.topPosts.length === 0 ? (
            <p className="text-sm text-default-400 py-6 text-center">
              {t("noTopContent")}
            </p>
          ) : (
            <div className="flex flex-col">
              {data.topPosts.map((p, i) => (
                <div
                  key={`${p.author}/${p.permlink}`}
                  className="flex items-center gap-2.5 py-2 border-b border-default-200/50 dark:border-default-100/20 last:border-0"
                >
                  <span className="w-5 shrink-0 text-center text-[11px] font-bold text-default-400">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/@${p.author}/${p.permlink}`}
                      className="block text-sm font-semibold truncate hover:text-primary transition-colors"
                      title={p.title}
                    >
                      {p.title}
                    </Link>
                    <div className="flex items-center gap-2.5 text-[10px] text-default-400">
                      <span className="flex items-center gap-0.5">
                        <MessageSquare size={10} />
                        {p.comments}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <ThumbsUp size={10} />
                        {p.votes}
                      </span>
                      <span className="font-mono">
                        {new Date(p.created * 1000).toISOString().slice(0, 10)}
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-mono font-bold text-emerald-500">
                    {usd(p.payout)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={CARD}>
          <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
            <MessageSquare size={16} className="text-violet-500" />
            {t("topComments")}
          </h3>
          <p className="text-xs text-default-400 mb-2">{t("contentSub")}</p>
          {data.topComments.length === 0 ? (
            <p className="text-sm text-default-400 py-6 text-center">
              {t("noTopContent")}
            </p>
          ) : (
            <div className="flex flex-col">
              {data.topComments.map((c, i) => (
                <div
                  key={`${c.author}/${c.permlink}`}
                  className="flex items-center gap-2.5 py-2 border-b border-default-200/50 dark:border-default-100/20 last:border-0"
                >
                  <span className="w-5 shrink-0 text-center text-[11px] font-bold text-default-400">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/@${c.author}/${c.permlink}`}
                      className="block text-sm font-semibold truncate hover:text-primary transition-colors"
                      title={c.root_title || c.permlink}
                    >
                      {c.root_title || c.permlink}
                    </Link>
                    <div className="flex items-center gap-2.5 text-[10px] text-default-400">
                      <span className="font-mono">
                        {new Date(c.created * 1000).toISOString().slice(0, 10)}
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-mono font-bold text-emerald-500">
                    {usd(c.payout)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserStatsPanel;
