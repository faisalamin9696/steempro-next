import type { ChainParameters } from "@/utils/explorerStats";
import { formatTime } from "./format";

/**
 * Network parameter reference table (server-rendered).
 */
export default function ExplorerChainParameters({
  params,
}: {
  params: ChainParameters;
}) {
  const parseTime = (value: string | null): string => {
    if (!value) return "—";
    const ts = Date.parse(value);
    return Number.isNaN(ts) ? value : formatTime(Math.floor(ts / 1000));
  };

  const rows: Array<{ label: string; value: React.ReactNode; title?: string }> =
    [
      { label: "Head block", value: params.headBlock.toLocaleString("en-US") },
      {
        label: "Last irreversible block",
        value: params.lastIrreversible.toLocaleString("en-US"),
      },
      {
        label: "Total accounts",
        value: params.accountCount.toLocaleString("en-US"),
      },
      { label: "Hardfork version", value: params.hardfork },
      {
        label: "Next scheduled hardfork",
        value: params.nextHardfork
          ? `${params.nextHardfork} (${parseTime(params.nextHardforkTime)})`
          : "None scheduled",
      },
      { label: "Block interval", value: `${params.blockInterval} seconds` },
      {
        label: "SBD print rate",
        value: `${(params.sbdPrintRate / 10).toFixed(1)} %`,
        title: `${params.sbdPrintRate}/1000`,
      },
      {
        label: "SBD interest rate",
        value: `${params.sbdInterestRate} %`,
      },
      { label: "Account creation fee", value: params.accountCreationFee },
      {
        label: "Max block size",
        value: `${(params.maxBlockSize / 1024).toFixed(0)} KB`,
      },
      {
        label: "Max vesting withdraw",
        value: `${(params.vestingWithdrawPercent / 100).toFixed(0)} %`,
      },
      {
        label: "Reward fund balance",
        value: params.rewardFundBalance,
      },
      {
        label: "Reward fund recent claims",
        value: params.rewardFundRecentClaims,
      },
      { label: "Median feed price", value: params.medianPrice },
    ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-center justify-between gap-4 py-2.5 border-b border-default-100 dark:border-default-100/30 last:border-0"
        >
          <span className="text-xs text-default-500 dark:text-default-400">
            {row.label}
          </span>
          <span
            className="text-xs font-mono font-bold text-right truncate"
            title={row.title ?? undefined}
          >
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}
