"use client";

import Link from "@/components/ui/CustomLink";
import SAvatar from "@/components/ui/SAvatar";
import { compact, usd } from "@/components/explorer/format";
import { Crown, Trophy, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import type {
  CommunityAuthorStats,
  CommunityViewerStats,
} from "@/utils/communityStats";

/**
 * "Race graph" — top community members ranked head-to-head on a switchable
 * metric, drawn as animated horizontal bars with avatars. The signed-in
 * viewer gets a highlighted row so they can see exactly how they stack up
 * ("3.2× you" per racer / "you're #12, top 5%").
 */

type Metric = "rewards" | "posts" | "comments" | "engagement";

type RaceRow = {
  author: string;
  value: number;
  rank: number;
  isViewer: boolean;
};

const BAR_COLORS = [
  "linear-gradient(90deg, #f59e0b, #fbbf24)", // 1st — gold
  "linear-gradient(90deg, #94a3b8, #cbd5e1)", // 2nd — silver
  "linear-gradient(90deg, #f97316, #fb923c)", // 3rd — bronze
];

function CommunityRaceGraph({
  authors,
  viewer,
  resetKey,
}: {
  authors: CommunityAuthorStats[];
  viewer: CommunityViewerStats | null;
  resetKey: string;
}) {
  const t = useTranslations("Community.statsPanel");
  const [metric, setMetric] = useState<Metric>("rewards");
  // Bars start collapsed on the server (and first client paint) and grow in
  // on mount — widths are applied in an effect so SSR markup matches.
  const [grown, setGrown] = useState(false);

  useEffect(() => {
    setGrown(false);
    const id = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  const viewerValue = viewer ? (viewer[metric] as number) : 0;

  const rows = useMemo<RaceRow[]>(() => {
    const value = (a: { [k in Metric]: number }) => a[metric] as number;
    const top = [...authors]
      .filter((a) => value(a) > 0)
      .sort((a, b) => value(b) - value(a))
      .slice(0, 12);

    const list: RaceRow[] = top.map((a, i) => ({
      author: a.author,
      value: value(a),
      rank: i + 1,
      isViewer: viewer?.author === a.author,
    }));

    // The viewer raced outside the top list — pin them at the bottom so they
    // always see their standing against the leaders.
    if (
      viewer &&
      viewerValue > 0 &&
      !list.some((r) => r.author === viewer.author)
    ) {
      list.push({
        author: viewer.author,
        value: viewerValue,
        rank: viewer.ranks[metric],
        isViewer: true,
      });
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authors, viewer, metric, viewerValue]);

  const maxValue = Math.max(1, ...rows.map((r) => r.value));
  const total = viewer?.total || authors.length || 1;
  const leader = rows[0];
  const viewerRank = viewer?.ranks[metric] ?? 0;
  const viewerPercentile = viewer
    ? Math.max(1, Math.ceil((viewerRank / total) * 100))
    : 0;
  const racing = !!viewer && (viewer.posts > 0 || viewer.comments > 0);

  const metricButtons: { id: Metric; label: string }[] = [
    { id: "rewards", label: t("metricRewards") },
    { id: "posts", label: t("metricPosts") },
    { id: "comments", label: t("metricComments") },
    { id: "engagement", label: t("metricEngagement") },
  ];

  const formatValue = (v: number) =>
    metric === "rewards" ? usd(v) : compact(v);

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <Trophy size={28} className="text-default-300" />
        <p className="text-sm text-default-400">{t("raceEmpty")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* header: title + metric switch */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold flex items-center gap-2">
            <TrendingUp size={18} className="text-primary" />
            {t("race")}
          </h3>
          <p className="text-xs text-default-400 mt-0.5">
            {t("raceSubtitle")}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-default-100/70 dark:bg-default-100/20">
          {metricButtons.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMetric(m.id)}
              aria-pressed={metric === m.id}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                metric === m.id
                  ? "bg-primary text-white shadow-sm"
                  : "text-default-500 hover:text-foreground"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* summary line */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-default-500">
        {leader ? (
          <span className="flex items-center gap-1.5">
            <Crown size={14} className="text-amber-500" />
            {t("leader")}:{" "}
            <span className="font-semibold text-foreground">
              @{leader.author}
            </span>
          </span>
        ) : null}
        <span>{t("membersInWindow", { count: total })}</span>
        {viewer ? (
          racing ? (
            <span className="font-semibold text-primary">
              {t("yourRank", { rank: viewerRank, total })} —{" "}
              {t("topPercent", { pct: viewerPercentile })}
            </span>
          ) : (
            <span className="text-default-400">{t("notRacing")}</span>
          )
        ) : (
          <span className="text-default-400">{t("signInToRace")}</span>
        )}
      </div>

      {/* racer rows */}
      <div className="flex flex-col gap-2">
        {rows.map((row) => {
          const pct = Math.max(1.5, (row.value / maxValue) * 100);
          const inTop = row.rank <= 3;
          return (
            <div
              key={row.author}
              className={`flex items-center gap-2 sm:gap-3 rounded-xl px-2 sm:px-3 py-2 border transition-colors ${
                row.isViewer
                  ? "border-primary/50 bg-primary/5"
                  : "border-transparent hover:bg-default-100/50 dark:hover:bg-default-100/10"
              }`}
            >
              {/* rank badge */}
              <span
                className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  row.rank === 1
                    ? "bg-amber-500/15 text-amber-600"
                    : row.rank === 2
                      ? "bg-slate-400/15 text-slate-500"
                      : row.rank === 3
                        ? "bg-orange-500/15 text-orange-600"
                        : "bg-default-200/70 dark:bg-default-100/20 text-default-500"
                }`}
              >
                {row.rank}
              </span>

              {/* racer */}
              <div className="flex items-center gap-2 shrink-0 min-w-0 w-28 sm:w-40">
                <SAvatar
                  username={row.author}
                  size="xs"
                  quality="small"
                  showLink={false}
                  className="shrink-0"
                />
                <Link
                  href={`/@${row.author}`}
                  className="text-xs font-semibold truncate hover:text-primary transition-colors"
                  title={`@${row.author}`}
                >
                  {row.author}
                </Link>
                {row.rank === 1 ? (
                  <Crown size={13} className="text-amber-500 shrink-0" />
                ) : null}
                {row.isViewer ? (
                  <span className="px-1.5 py-0.5 rounded-md bg-primary text-white text-[9px] font-bold shrink-0">
                    {t("you")}
                  </span>
                ) : null}
              </div>

              {/* bar */}
              <div className="flex-1 min-w-0 h-6 rounded-lg bg-default-100/80 dark:bg-default-100/20 overflow-hidden">
                <div
                  className={`h-full rounded-lg transition-all duration-700 ease-out ${
                    row.isViewer ? "" : inTop ? "" : ""
                  }`}
                  style={{
                    width: grown ? `${pct}%` : "0%",
                    background: row.isViewer
                      ? "linear-gradient(90deg, var(--primary), color-mix(in srgb, var(--primary) 60%, white))"
                      : BAR_COLORS[row.rank - 1] ||
                        "linear-gradient(90deg, #6366f1, #8b5cf6)",
                  }}
                />
              </div>

              {/* value + standing vs viewer */}
              <span className="w-16 sm:w-20 shrink-0 text-right text-xs font-mono font-bold text-foreground">
                {formatValue(row.value)}
              </span>
              <span
                className="hidden sm:block w-16 shrink-0 text-right text-[11px] font-semibold text-default-400"
                title={
                  viewer && !row.isViewer && viewerValue > 0
                    ? t("xTimes", {
                        value: (row.value / viewerValue).toFixed(1),
                      })
                    : undefined
                }
              >
                {viewer && !row.isViewer && viewerValue > 0
                  ? `${(row.value / viewerValue).toFixed(1)}×`
                  : `top ${Math.max(1, Math.ceil((row.rank / total) * 100))}%`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CommunityRaceGraph;
