import { connection } from "next/server";
import { getTranslations } from "next-intl/server";
import { Clock, Database, Layers, TrendingUp } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import ExplorerSearch from "@/components/explorer/ExplorerSearch";
import ExplorerGlobalStats from "@/components/explorer/ExplorerGlobalStats";
import ExplorerTabs from "@/components/explorer/ExplorerTabs";
import ExplorerChainTotals from "@/components/explorer/ExplorerChainTotals";
import ExplorerMarketSummary from "@/components/explorer/ExplorerMarketSummary";
import ExplorerRecentBlocks from "@/components/explorer/ExplorerRecentBlocks";
import ExplorerSection from "@/components/explorer/ExplorerSection";
import {
  EMPTY_CHAIN_STATS,
  getChainStats,
  getLiveSnapshot,
  getMarketSummary,
  getRecentBlocks,
  safe,
} from "@/utils/explorerStats";

/**
 * Steem blockchain explorer dashboard.
 *
 * Tabbed shell: only the Overview tab is server-rendered (chain totals,
 * 24h market snapshot, KPI strip + live block stream, both SSR-seeded so
 * real values and deep links ship in the initial HTML), keeping server
 * work to four memoized fetches. Every other tab fetches exactly one
 * /api/explorer section on first activation — nothing else is requested.
 */

const TAB_IDS = [
  "overview",
  "activity",
  "statistics",
  "content",
  "leaderboards",
  "parameters",
  "lookup",
];
const LOOKUP_IDS = ["blocks", "transactions", "accounts"];

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ExplorerPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // cacheComponents: opt this page into per-request rendering.
  await connection();

  const sp = await searchParams;
  const t = await getTranslations("Explorer");

  const rawTab = typeof sp.tab === "string" ? sp.tab : "";
  const initialTab = TAB_IDS.includes(rawTab) ? rawTab : "overview";
  const rawSub = typeof sp.sub === "string" ? sp.sub : "";
  const initialLookup = LOOKUP_IDS.includes(rawSub) ? rawSub : "blocks";
  const initialQuery = typeof sp.q === "string" ? sp.q : undefined;

  // Overview-only fetches (all memoized in-process): the static overview
  // groups plus SSR seeds for the two live widgets so the initial HTML
  // carries real KPI values and block links for crawlers.
  const [chainStats, market, live, recentBlocks] = await Promise.all([
    safe(getChainStats(), EMPTY_CHAIN_STATS),
    safe(getMarketSummary(24, 3600), null),
    safe(getLiveSnapshot(), null),
    safe(getRecentBlocks(10), []),
  ]);

  const overview = (
    <div className="space-y-8">
      <section>
        <ExplorerSection
          icon={Database}
          title={t("sections.chainTotals")}
          description={t("sections.chainTotalsDesc")}
        />
        <ExplorerChainTotals stats={chainStats} />
      </section>

      <section>
        <ExplorerSection
          icon={TrendingUp}
          title={t("sections.market")}
          description={t("sections.marketDesc")}
        />
        <ExplorerMarketSummary summary={market} windowLabel="24h" />
      </section>

      <section>
        <ExplorerSection
          icon={Clock}
          title={t("recentBlocks")}
          description="Last 10 blocks · refreshes every 3 seconds"
        />
        <ExplorerRecentBlocks
          initial={recentBlocks.length ? recentBlocks : undefined}
        />
      </section>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        title={t("title")}
        description={t("description")}
        icon={Layers}
        color="primary"
      />

      {/* Unified search */}
      <ExplorerSearch />

      {/* Live global stats (3s refresh, SSR-seeded) */}
      <ExplorerGlobalStats initial={live ?? undefined} />

      {/* Dashboard tabs — only the selected panel mounts and fetches */}
      <ExplorerTabs
        initialTab={initialTab}
        initialLookup={initialLookup}
        initialQuery={initialQuery}
        overview={overview}
      />
    </div>
  );
}
