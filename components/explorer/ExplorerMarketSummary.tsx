import {
  ChevronsDown,
  ChevronsUp,
  Coins,
  DollarSign,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import StatCard from "./StatCard";
import type { MarketSummary } from "@/utils/marketSummary";
import { compact } from "./format";

/**
 * Headline internal-market numbers (server-safe presentational component).
 * Used by the Overview tab (24h snapshot) and the Activity tab (range-aware).
 */
export default function ExplorerMarketSummary({
  summary,
  windowLabel = "24h",
}: {
  summary: MarketSummary | null;
  windowLabel?: string;
}) {
  if (!summary || summary.buckets === 0) {
    return (
      <div className="rounded-xl border border-default-200/60 dark:border-default-100/40 bg-white/60 dark:bg-content1/30 px-4 py-10 text-center text-sm text-default-400">
        No internal-market trades in the last {windowLabel}
      </div>
    );
  }

  const up = summary.changePct >= 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      <StatCard
        icon={DollarSign}
        label="STEEM price"
        value={`$${summary.price.toFixed(4)}`}
        sub={`internal market · ${windowLabel}`}
        tone="blue"
        href="/market"
      />
      <StatCard
        icon={up ? TrendingUp : TrendingDown}
        label={`Change · ${windowLabel}`}
        value={`${up ? "+" : ""}${summary.changePct.toFixed(2)}%`}
        tone={up ? "green" : "red"}
        sub="first → last priced bucket"
      />
      <StatCard
        icon={ChevronsUp}
        label={`High · ${windowLabel}`}
        value={`$${summary.high.toFixed(4)}`}
        tone="emerald"
        sub="highest trade bucket"
      />
      <StatCard
        icon={ChevronsDown}
        label={`Low · ${windowLabel}`}
        value={`$${summary.low.toFixed(4)}`}
        tone="rose"
        sub="lowest trade bucket"
      />
      <StatCard
        icon={Coins}
        label={`Volume STEEM · ${windowLabel}`}
        value={compact(summary.volumeSteem)}
        tone="violet"
        title={summary.volumeSteem.toLocaleString("en-US")}
        sub={`${summary.buckets} priced buckets`}
      />
      <StatCard
        icon={Coins}
        label={`Volume SBD · ${windowLabel}`}
        value={compact(summary.volumeSbd)}
        tone="amber"
        title={summary.volumeSbd.toLocaleString("en-US")}
        sub="stablecoin side"
      />
    </div>
  );
}
