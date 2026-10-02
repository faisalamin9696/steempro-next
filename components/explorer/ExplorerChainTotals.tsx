import { BarChart3, Coins, Database, FileText, MessageSquare, Users } from "lucide-react";
import type { ChainStats } from "@/utils/explorerStats";
import StatCard from "./StatCard";
import { compact, full } from "./format";

/**
 * Lifetime chain totals from chain_api.getChainStats (server-rendered on the
 * Overview tab, rendered on the shared StatCard for a consistent look).
 */
export default function ExplorerChainTotals({ stats }: { stats: ChainStats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
      <StatCard
        icon={Database}
        label="Transactions"
        value={compact(stats.count_transactions)}
        title={full(stats.count_transactions)}
        sub="all time"
        tone="blue"
      />
      <StatCard
        icon={BarChart3}
        label="Operations"
        value={compact(stats.count_operations + stats.count_virtual_operations)}
        title={full(stats.count_operations + stats.count_virtual_operations)}
        sub={`${compact(stats.count_virtual_operations)} virtual`}
        tone="violet"
      />
      <StatCard
        icon={Users}
        label="Accounts"
        value={compact(stats.count_accounts)}
        title={full(stats.count_accounts)}
        sub="all time"
        tone="emerald"
      />
      <StatCard
        icon={Coins}
        label="Witnesses"
        value={compact(stats.count_witnesses)}
        title={full(stats.count_witnesses)}
        sub="all time"
        tone="amber"
      />
      <StatCard
        icon={FileText}
        label="Posts"
        value={compact(stats.count_posts)}
        title={full(stats.count_posts)}
        sub={`${compact(stats.count_deleted_posts)} deleted`}
        tone="rose"
      />
      <StatCard
        icon={MessageSquare}
        label="Comments"
        value={compact(stats.count_comments)}
        title={full(stats.count_comments)}
        sub={`${compact(stats.count_deleted_comments)} deleted`}
        tone="sky"
      />
    </div>
  );
}
