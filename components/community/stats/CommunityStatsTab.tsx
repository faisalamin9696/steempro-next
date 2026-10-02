"use client";

import SectionError from "@/components/explorer/SectionError";
import {
  ChartSkeleton,
  StatGridSkeleton,
  TableSkeleton,
} from "@/components/explorer/Skeleton";
import { compact, full, usd } from "@/components/explorer/format";
import LineChart, { type LineSeries } from "@/components/explorer/charts/LineChart";
import StatCard from "@/components/explorer/StatCard";
import SAvatar from "@/components/ui/SAvatar";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Coins,
  FileText,
  Gem,
  MessageCircle,
  MessageSquare,
  MessagesSquare,
  ThumbsUp,
  Type as TypeIcon,
  UserPlus,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import type {
  CommunityAuthorStats,
  CommunityRange,
  CommunityStats,
} from "@/utils/communityStats";
import CommunityRaceGraph from "./CommunityRaceGraph";
import CommunityTagStats from "./CommunityTagStats";

/**
 * Community Stats tab — KPIs, time-series charts, the member race graph,
 * leadership performance, top rewarded content and a sortable author table.
 *
 * One SWR request per selected range returns the whole bundle; the server
 * seeds the default (7d) range via `initialStats` so first paint — including
 * SSR HTML — shows real numbers instead of skeletons.
 */

const CARD =
  "rounded-xl border border-default-200/60 dark:border-default-100/40 bg-white/60 dark:bg-content1/30 p-4";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res.json();
};

const RANGES: CommunityRange[] = ["7d", "30d", "90d"];

function CommunityStatsTab({
  account,
  viewer,
  initialStats,
}: {
  account: string;
  viewer?: string;
  initialStats?: CommunityStats;
}) {
  const t = useTranslations("Community.statsPanel");
  const [range, setRange] = useState<CommunityRange>("7d");
  // Charts gate on mount: their axis labels use locale-dependent date
  // formatting, which must not run during SSR (hydration mismatch).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const key =
    `/api/community/stats?community=${account}&range=${range}` +
    (viewer ? `&observer=${encodeURIComponent(viewer)}` : "");

  const { data, error, isValidating, mutate } = useSWR<CommunityStats>(
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
    // Per-section shimmering placeholders while the range bundle loads.
    return (
      <div className="flex flex-col gap-4" aria-busy>
        <StatGridSkeleton
          count={9}
          className="grid grid-cols-2 lg:grid-cols-3 gap-3"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <ChartSkeleton height={240} />
          <ChartSkeleton height={240} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <ChartSkeleton height={240} />
          <ChartSkeleton height={240} />
        </div>
        <TableSkeleton rows={8} />
        <TableSkeleton rows={6} />
      </div>
    );
  }

  const { totals, series, authors, topPosts, topComments, leaders } = data;
  const viewerStats = data.viewer;

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
  ];
  const rewardsSeries: LineSeries[] = [
    {
      name: t("rewardsSeries"),
      color: "#10b981",
      points: series.map((p) => ({ x: p.t, y: Math.round(p.payout * 100) / 100 })),
    },
  ];
  const votesSeries: LineSeries[] = [
    {
      name: t("votesSeries"),
      color: "#f59e0b",
      points: series.map((p) => ({ x: p.t, y: p.votes })),
    },
  ];

  const rangeLabels: Record<CommunityRange, string> = {
    "7d": t("range7d"),
    "30d": t("range30d"),
    "90d": t("range90d"),
  };

  const roleLabel = (role: string) =>
    role === "owner"
      ? t("roleOwner")
      : role === "admin"
        ? t("roleAdmin")
        : t("roleMod");
  const roleColor = (role: string) =>
    role === "owner" ? "amber" : role === "admin" ? "violet" : "blue";

  const columns: ColumnDef<CommunityAuthorStats>[] = [
    {
      key: "author",
      header: t("colAuthor"),
      sortable: true,
      searchable: true,
      render: (_v, row) => (
        <div className="flex items-center gap-2 min-w-0">
          <SAvatar username={row.author} size="xxs" showLink={false} />
          <a
            href={`/@${row.author}`}
            className="truncate text-sm font-semibold hover:text-primary transition-colors"
          >
            {row.author}
          </a>
          {viewerStats?.author === row.author ? (
            <span className="px-1.5 py-0.5 rounded-md bg-primary text-white text-[9px] font-bold shrink-0">
              {t("you")}
            </span>
          ) : null}
        </div>
      ),
    },
    {
      key: "posts",
      header: t("colPosts"),
      sortable: true,
      render: (v) => <span className="font-mono text-xs">{full(v as number)}</span>,
    },
    {
      key: "comments",
      header: t("colComments"),
      sortable: true,
      render: (v) => <span className="font-mono text-xs">{full(v as number)}</span>,
    },
    {
      key: "rewards",
      header: t("colRewards"),
      sortable: true,
      render: (v) => (
        <span className="font-mono text-xs font-bold text-emerald-500">
          {usd(v as number)}
        </span>
      ),
    },
    {
      key: "engagement",
      header: t("colEngagement"),
      sortable: true,
      render: (v) => (
        <span className="font-mono text-xs text-primary">{full(v as number)}</span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* ---------------------------------------------------------------- */}
      {/* header: heading + partial notice + range switch                  */}
      {/* ---------------------------------------------------------------- */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Activity size={20} className="text-primary" />
            {t("heading")}
          </h2>
          <p className="text-xs text-default-400 mt-0.5">{t("subtitle")}</p>
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

      {/* ---------------------------------------------------------------- */}
      {/* KPI strip                                                        */}
      {/* ---------------------------------------------------------------- */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard
          icon={FileText}
          tone="blue"
          label={t("posts")}
          value={full(totals.posts)}
          sub={t("postsSub")}
        />
        <StatCard
          icon={MessageSquare}
          tone="violet"
          label={t("comments")}
          value={full(totals.comments)}
          sub={t("commentsSub")}
        />
        <StatCard
          icon={Zap}
          tone="amber"
          label={t("engagementRate")}
          value={`${totals.engagementRate.toFixed(1)}×`}
          sub={t("engagementRateSub")}
          title={totals.engagementRate.toFixed(3)}
        />
        <StatCard
          icon={Coins}
          tone="emerald"
          label={t("rewards")}
          value={usd(totals.rewards)}
          sub={t("rewardsSub")}
          title={totals.rewards.toFixed(2)}
        />
        <StatCard
          icon={Users}
          tone="sky"
          label={t("activeMembers")}
          value={full(totals.activeMembers)}
          sub={t("activeMembersSub")}
        />
        <StatCard
          icon={Wallet}
          tone="primary"
          label={t("avgPayout")}
          value={usd(totals.avgPostPayout)}
          sub={t("avgPayoutSub")}
          title={totals.avgPostPayout.toFixed(4)}
        />
        <StatCard
          icon={ThumbsUp}
          tone="green"
          label={t("upvoteRatio")}
          value={`${(totals.upvoteRatio * 100).toFixed(0)}%`}
          sub={t("upvoteRatioSub")}
          title={totals.upvoteRatio.toFixed(4)}
        />
        <StatCard
          icon={UserPlus}
          tone="rose"
          label={t("members")}
          value={full(data.community.count_subs)}
          sub={t("membersSub")}
        />
        <StatCard
          icon={Gem}
          tone="red"
          label={t("pendingRewards")}
          value={usd(data.community.sum_pending)}
          sub={t("pendingRewardsSub")}
          title={data.community.sum_pending.toFixed(2)}
        />
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* charts                                                           */}
      {/* ---------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className={CARD}>
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <BarChart3 size={16} className="text-primary" />
            {t("activityChart")}
          </h3>
          {mounted ? (
            <LineChart
              series={activitySeries}
              height={240}
              yFormat="int"
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
        <div className={CARD}>
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <Coins size={16} className="text-emerald-500" />
            {t("rewardsChart")}
          </h3>
          {mounted ? (
            <LineChart
              series={rewardsSeries}
              height={240}
              area
              yFormat="usd0"
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className={CARD}>
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <ThumbsUp size={16} className="text-amber-500" />
            {t("votesChart")}
          </h3>
          {mounted ? (
            <LineChart
              series={votesSeries}
              height={240}
              area
              yFormat="int"
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

        {/* engagement breakdown tiles */}
        <div className={CARD}>
          <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
            <Zap size={16} className="text-violet-500" />
            {t("breakdown")}
          </h3>
          <p className="text-xs text-default-400 mb-3">{t("breakdownSub")}</p>
          <div className="grid grid-cols-2 gap-3">
            <BreakdownTile
              icon={<MessageCircle size={15} />}
              label={t("commentsPerPost")}
              value={totals.commentsPerPost.toFixed(1)}
              color="text-blue-500"
            />
            <BreakdownTile
              icon={<ThumbsUp size={15} />}
              label={t("votesPerPost")}
              value={totals.votesPerPost.toFixed(1)}
              color="text-amber-500"
            />
            <BreakdownTile
              icon={<MessagesSquare size={15} />}
              label={t("discussedPct")}
              value={`${(totals.discussedPct * 100).toFixed(0)}%`}
              color="text-violet-500"
            />
            <BreakdownTile
              icon={<TypeIcon size={15} />}
              label={t("wordsTotal")}
              value={compact(totals.words)}
              color="text-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* top tags                                                         */}
      {/* ---------------------------------------------------------------- */}
      <div className={CARD}>
        <CommunityTagStats
          tags={data.tags}
          totalPosts={totals.posts}
          resetKey={data.range}
        />
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* race graph                                                       */}
      {/* ---------------------------------------------------------------- */}
      <div className={CARD}>
        <CommunityRaceGraph
          authors={authors}
          viewer={viewerStats}
          resetKey={data.range}
        />
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* leaders                                                          */}
      {/* ---------------------------------------------------------------- */}
      {leaders.length > 0 ? (
        <div className={CARD}>
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Users size={16} className="text-primary" />
            {t("leaders")}
          </h3>
          <p className="text-xs text-default-400 mt-0.5 mb-3">
            {t("leadersSub")}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {leaders.map((l) => (
              <div
                key={l.account}
                className="rounded-xl border border-default-200/60 dark:border-default-100/40 bg-default-100/30 dark:bg-default-100/10 p-3 flex flex-col gap-2.5 transition-colors hover:border-primary/30"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <SAvatar username={l.account} size="sm" quality="small" />
                  <div className="min-w-0 flex-1">
                    <a
                      href={`/@${l.account}`}
                      className="block text-sm font-semibold truncate hover:text-primary transition-colors"
                    >
                      {l.account}
                    </a>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span
                        className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                          roleColor(l.role) === "amber"
                            ? "bg-amber-500/15 text-amber-600"
                            : roleColor(l.role) === "violet"
                              ? "bg-violet-500/15 text-violet-500"
                              : "bg-blue-500/15 text-blue-500"
                        }`}
                      >
                        {roleLabel(l.role)}
                      </span>
                      {typeof l.reputation === "number" ? (
                        <span className="px-1.5 py-0.5 rounded-md bg-default-200/60 dark:bg-default-100/20 text-[10px] font-semibold text-default-500">
                          {t("reputation")} {l.reputation.toFixed(1)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-emerald-500">
                      {usd(l.rewards)}
                    </p>
                    <p className="text-[10px] text-default-400">
                      {t("followers")} {compact(l.followers ?? 0)}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1 text-center">
                  <div className="rounded-lg bg-default-100/60 dark:bg-default-100/10 py-1.5">
                    <p className="text-sm font-bold">{full(l.posts)}</p>
                    <p className="text-[10px] text-default-400">
                      {t("colPosts")}
                    </p>
                  </div>
                  <div className="rounded-lg bg-default-100/60 dark:bg-default-100/10 py-1.5">
                    <p className="text-sm font-bold">{full(l.comments)}</p>
                    <p className="text-[10px] text-default-400">
                      {t("colComments")}
                    </p>
                  </div>
                  <div className="rounded-lg bg-default-100/60 dark:bg-default-100/10 py-1.5">
                    <p className="text-sm font-bold">{full(l.engagement)}</p>
                    <p className="text-[10px] text-default-400">
                      {t("colEngagement")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* ---------------------------------------------------------------- */}
      {/* top rewarded content                                             */}
      {/* ---------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className={CARD}>
          <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
            <FileText size={16} className="text-blue-500" />
            {t("topPosts")}
          </h3>
          <p className="text-xs text-default-400 mb-2">{t("contentSub")}</p>
          {topPosts.length === 0 ? (
            <p className="text-sm text-default-400 py-6 text-center">
              {t("noTopContent")}
            </p>
          ) : (
            <div className="flex flex-col">
              {topPosts.map((p, i) => (
                <div
                  key={`${p.author}/${p.permlink}`}
                  className="flex items-center gap-2.5 py-2 border-b border-default-200/50 dark:border-default-100/20 last:border-0"
                >
                  <span className="w-5 shrink-0 text-center text-[11px] font-bold text-default-400">
                    {i + 1}
                  </span>
                  <SAvatar username={p.author} size="xxs" showLink={false} />
                  <div className="min-w-0 flex-1">
                    <a
                      href={`/@${p.author}/${p.permlink}`}
                      className="block text-sm font-semibold truncate hover:text-primary transition-colors"
                      title={p.title}
                    >
                      {p.title}
                    </a>
                    <div className="flex items-center gap-2.5 text-[10px] text-default-400">
                      <span>@{p.author}</span>
                      <span className="flex items-center gap-0.5">
                        <MessageSquare size={10} />
                        {p.comments}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <ThumbsUp size={10} />
                        {p.votes}
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
          {topComments.length === 0 ? (
            <p className="text-sm text-default-400 py-6 text-center">
              {t("noTopContent")}
            </p>
          ) : (
            <div className="flex flex-col">
              {topComments.map((c, i) => (
                <div
                  key={`${c.author}/${c.permlink}`}
                  className="flex items-center gap-2.5 py-2 border-b border-default-200/50 dark:border-default-100/20 last:border-0"
                >
                  <span className="w-5 shrink-0 text-center text-[11px] font-bold text-default-400">
                    {i + 1}
                  </span>
                  <SAvatar username={c.author} size="xxs" showLink={false} />
                  <div className="min-w-0 flex-1">
                    <a
                      href={`/@${c.author}/${c.permlink}`}
                      className="block text-sm font-semibold truncate hover:text-primary transition-colors"
                      title={c.root_title || c.permlink}
                    >
                      {c.root_title || c.permlink}
                    </a>
                    <div className="flex items-center gap-2.5 text-[10px] text-default-400">
                      <span>@{c.author}</span>
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

      {/* ---------------------------------------------------------------- */}
      {/* top authors table                                                */}
      {/* ---------------------------------------------------------------- */}
      <div className={CARD}>
        <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
          <BarChart3 size={16} className="text-primary" />
          {t("topAuthors")}
        </h3>
        <p className="text-xs text-default-400 mb-3">{t("topAuthorsSub")}</p>
        {authors.length === 0 ? (
          <p className="text-sm text-default-400 py-6 text-center">
            {t("emptyTable")}
          </p>
        ) : (
          <DataTable
            columns={columns}
            data={authors}
            rowIdKey="author"
            searchPlaceholder={t("searchAuthors")}
            emptyMessage={t("emptyTable")}
          />
        )}
      </div>
    </div>
  );
}

function BreakdownTile({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-default-200/60 dark:border-default-100/40 bg-default-100/40 dark:bg-default-100/10 p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <span className={color}>{icon}</span>
        <span className="text-[11px] text-default-500 dark:text-default-400 uppercase tracking-wider truncate">
          {label}
        </span>
      </div>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}

export default CommunityStatsTab;
