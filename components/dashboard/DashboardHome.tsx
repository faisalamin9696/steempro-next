"use client";

import UserStatsPanel from "@/components/dashboard/UserStatsPanel";
import SectionError from "@/components/explorer/SectionError";
import { compact } from "@/components/explorer/format";
import Link from "@/components/ui/CustomLink";
import { Crown, Shield, Star, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import type { AuthorStats, MyCommunity } from "@/utils/communityStats";

/**
 * Dashboard home: the user's own progress panel plus quick links to the
 * per-community admin panels where they hold a staff role (mod or above).
 */

const CARD =
  "rounded-xl border border-default-200/60 dark:border-default-100/40 bg-white/60 dark:bg-content1/30 p-4";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  return res.json();
};

function CommunityCard({
  c,
  previewAs,
}: {
  c: MyCommunity;
  previewAs?: string;
}) {
  const t = useTranslations("Community.statsPanel");
  const td = useTranslations("Dashboard");

  const roleLabel =
    c.role === "owner"
      ? t("roleOwner")
      : c.role === "admin"
        ? t("roleAdmin")
        : t("roleMod");
  const roleBadge =
    c.role === "owner"
      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
      : c.role === "admin"
        ? "bg-violet-500/10 text-violet-600 dark:text-violet-400"
        : "bg-blue-500/10 text-blue-600 dark:text-blue-400";
  const RoleIcon = c.role === "owner" ? Crown : c.role === "admin" ? Shield : Star;

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-default-200/60 dark:border-default-100/40 bg-white/70 dark:bg-content1/40 hover:border-primary/30 transition-colors min-w-0">
      <div className={`p-2 rounded-lg shrink-0 ${roleBadge}`}>
        <RoleIcon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold truncate">{c.title}</p>
        <div className="flex items-center gap-2 text-[10px] text-default-400">
          <span className={`px-1.5 py-0.5 rounded font-semibold ${roleBadge}`}>
            {roleLabel}
          </span>
          <span className="flex items-center gap-0.5">
            <Users size={10} />
            {compact(c.count_subs)}
          </span>
        </div>
      </div>
      <Link
        href={`/dashboard/community/${c.account}${previewAs ? `?as=${previewAs}` : ""}`}
        className="shrink-0 px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary text-[11px] font-bold hover:bg-primary hover:text-white transition-colors"
      >
        {td("openPanel")}
      </Link>
    </div>
  );
}

export default function DashboardHome({
  user,
  initialStats,
  previewAs,
}: {
  user: string;
  initialStats?: AuthorStats;
  previewAs?: string;
}) {
  const t = useTranslations("Dashboard");

  const { data: communities, error: commError } = useSWR<MyCommunity[]>(
    user ? `/api/dashboard/communities?author=${user}` : null,
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false },
  );

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* header */}
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          {t("title")}
        </h1>
        <p className="text-sm text-default-400 mt-0.5">{t("homeSub")}</p>
      </div>

      {/* my communities (mod+ entry points) */}
      <section className={CARD}>
        <h2 className="text-sm font-bold flex items-center gap-2 mb-1">
          <Users size={16} className="text-primary" />
          {t("myCommunities")}
        </h2>
        <p className="text-xs text-default-400 mb-3">{t("myCommunitiesSub")}</p>
        {commError ? (
          <SectionError onRetry={() => undefined} message={t("loadError")} />
        ) : !communities ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" aria-busy>
            {[0, 1].map((i) => (
              <div
                key={i}
                className="h-[62px] rounded-xl animate-pulse bg-default-200/60 dark:bg-default-100/10"
              />
            ))}
          </div>
        ) : communities.length === 0 ? (
          <p className="text-sm text-default-400 py-3">{t("noCommunities")}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {communities.map((c) => (
              <CommunityCard key={c.account} c={c} previewAs={previewAs} />
            ))}
          </div>
        )}
      </section>

      {/* my progress */}
      <section>
        <UserStatsPanel author={user} initialStats={initialStats} />
      </section>
    </div>
  );
}
