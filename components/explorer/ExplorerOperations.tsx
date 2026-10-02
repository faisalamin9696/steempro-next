import BarChart from "./charts/BarChart";
import type { OperationStat } from "@/utils/explorerStats";
import { full, opLabel } from "./format";

/**
 * Lifetime operation distribution from chain_api.getOperationStats.
 * Log scale — vote/comment counts span several magnitudes vs the rest.
 */
export default function ExplorerOperations({ ops }: { ops: OperationStat[] }) {
  const sorted = [...ops].sort((a, b) => b.total_count - a.total_count);
  const top = sorted.slice(0, 15);
  const totalAll = sorted.reduce((sum, op) => sum + op.total_count, 0);
  const topShare = totalAll
    ? Math.round(
        (top.reduce((sum, op) => sum + op.total_count, 0) / totalAll) * 100,
      )
    : 0;

  return (
    <div className="space-y-3">
      <BarChart
        log
        data={top.map((op) => ({
          label: opLabel(op.name),
          value: op.total_count,
          hint: `${op.name} — ${full(op.total_count)} operations (first block ${full(op.first_block)}${op.is_virtual ? ", virtual" : ""})`,
        }))}
      />
      <p className="text-[11px] text-default-400">
        Top {top.length} of {sorted.length} operation types · {topShare}% of all
        operations ever recorded
      </p>
    </div>
  );
}
