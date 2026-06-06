import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Zap,
  ArrowUpFromLine,
  ArrowDownToLine,
  Clock,
  Users,
  CircleDollarSign,
  Info,
  Landmark,
  DollarSign,
} from "lucide-react";
import { SteemIcon } from "../icons/SteemIcon";
import { useSteemUtils } from "@/hooks/useSteemUtils";
import { useSession } from "next-auth/react";
import { usePriceData } from "@/hooks/usePriceData";

interface BalanceCardProps {
  account: AccountExt;
  onTransfer: (currency: "STEEM" | "SBD") => void;
  onPowerUp: () => void;
  onPowerDown: () => void;
  onDelegate: () => void;
  onWithdrawSavings: (currency: "STEEM" | "SBD") => void;
  expiringCount: number;
}

export const BalanceCard = ({
  account,
  onTransfer,
  onPowerUp,
  onPowerDown,
  onDelegate,
  onWithdrawSavings,
  expiringCount,
}: BalanceCardProps) => {
  const { data: session } = useSession();
  const isMe = session?.user?.name === account.name;
  const { vestsToSteem } = useSteemUtils();
  const { isLoading, steemUsd, sbdUsd, error } = usePriceData();

  const showUsd = !isLoading && !error && steemUsd > 0;

  const ownSP = vestsToSteem(account.vests_own);
  const inSP = vestsToSteem(account.vests_in);
  const outSP = vestsToSteem(account.vests_out);
  const effectiveSP = ownSP - outSP + inSP;
  const availableSP =
    ownSP -
    outSP -
    vestsToSteem(account.powerdown) +
    vestsToSteem(account.powerdown_done);

  const steemUsdVal =
    (account.balance_steem + account.savings_steem + ownSP) * steemUsd;
  const sbdUsdVal = (account.balance_sbd + account.savings_sbd) * sbdUsd;
  const totalUsdVal = steemUsdVal + sbdUsdVal;

  const fmt = (n: number, d = 3) =>
    n.toLocaleString(undefined, {
      maximumFractionDigits: d,
      minimumFractionDigits: 0,
    });

  return (
    <div className="space-y-4">
      {/* ── Portfolio Summary Bar ─────────────────────────────────────── */}
      <Card
        shadow="none"
        className="card border border-default-200 dark:border-default-100/40"
      >
        <CardBody className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-default-500/30">
                <DollarSign size={20} className="text-default-600" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-default-400">
                  Portfolio Value
                </p>
                {showUsd ? (
                  <p className="text-2xl font-bold leading-tight">
                    ${fmt(totalUsdVal, 2)}
                    <span className="text-xs font-normal text-default-400 ml-1">
                      USD
                    </span>
                  </p>
                ) : (
                  <p className="text-2xl font-bold leading-tight text-default-300">
                    —
                  </p>
                )}
              </div>
            </div>

            {/* Sparkline-style token distribution pills */}
            {showUsd && totalUsdVal > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <TokenPill
                  label="STEEM"
                  pct={(steemUsdVal / totalUsdVal) * 100}
                  color="bg-primary"
                />
                <TokenPill
                  label="SBD"
                  pct={(sbdUsdVal / totalUsdVal) * 100}
                  color="bg-success"
                />
              </div>
            )}
          </div>

          {/* Distribution bar */}
          {showUsd && totalUsdVal > 0 && (
            <div className="mt-3 flex h-1.5 rounded-full overflow-hidden gap-0.5">
              <div
                className="bg-primary rounded-full transition-all"
                style={{ width: `${(steemUsdVal / totalUsdVal) * 100}%` }}
              />
              <div
                className="bg-success rounded-full transition-all"
                style={{ width: `${(sbdUsdVal / totalUsdVal) * 100}%` }}
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* ── Token Grid ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 gap-4">
        {/* STEEM */}
        <TokenCard
          icon={<SteemIcon className="w-5 h-5" />}
          iconClass="bg-primary/10 text-primary"
          label="STEEM"
          subtitle="Liquid"
          amount={fmt(account.balance_steem)}
          usdAmount={
            showUsd ? `$${fmt(account.balance_steem * steemUsd, 2)}` : null
          }
          tooltip="Tradeable token that can be transferred anytime. Convert to STEEM POWER by powering up."
          savings={
            account.savings_steem > 0 ? fmt(account.savings_steem) : null
          }
          savingsLabel="Savings"
          savingsTooltip="Subject to 3-day withdrawal waiting period"
          actions={
            session?.user?.name ? (
              <div className="flex gap-2 mt-3 pt-3 border-t border-default-200 dark:border-default-100/20">
                <Button
                  size="sm"
                  variant="flat"
                  color="primary"
                  className="flex-1 font-semibold text-xs h-8"
                  startContent={<ArrowUpRight size={14} />}
                  onPress={() => onTransfer("STEEM")}
                >
                  Transfer
                </Button>
                {isMe && (
                  <Button
                    size="sm"
                    variant="flat"
                    color="secondary"
                    className="flex-1 font-semibold text-xs h-8"
                    startContent={<Zap size={14} />}
                    onPress={onPowerUp}
                  >
                    Power Up
                  </Button>
                )}
              </div>
            ) : null
          }
          onWithdraw={
            isMe && account.savings_steem > 0
              ? () => onWithdrawSavings("STEEM")
              : undefined
          }
        />

        {/* SBD */}
        <TokenCard
          icon={<CircleDollarSign size={20} />}
          iconClass="bg-success/10 text-success"
          label="Steem Dollars"
          subtitle="SBD"
          amount={fmt(account.balance_sbd)}
          usdAmount={
            showUsd ? `$${fmt(account.balance_sbd * sbdUsd, 2)}` : null
          }
          tooltip="Tokens designed to be pegged to $1 USD. Convertible to STEEM over 3.5 days."
          savings={account.savings_sbd > 0 ? fmt(account.savings_sbd) : null}
          savingsLabel="Savings"
          savingsTooltip="Subject to 3-day withdrawal waiting period"
          actions={
            session?.user?.name ? (
              <div className="flex gap-2 mt-3 pt-3 border-t border-default-200 dark:border-default-100/20">
                <Button
                  size="sm"
                  variant="flat"
                  color="success"
                  className="flex-1 font-semibold text-xs h-8"
                  startContent={<ArrowUpRight size={14} />}
                  onPress={() => onTransfer("SBD")}
                >
                  Transfer
                </Button>
              </div>
            ) : null
          }
          onWithdraw={
            isMe && account.savings_sbd > 0
              ? () => onWithdrawSavings("SBD")
              : undefined
          }
        />

        {/* STEEM POWER */}
        <Card
          shadow="none"
          className="card border border-default-200 dark:border-default-100/40 xs:col-span-1 sm:col-span-2"
        >
          <CardBody className="p-4 space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-secondary/10 text-secondary shrink-0">
                  <Zap size={22} fill="currentColor" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-xs font-bold uppercase tracking-wider text-default-500">
                      Steem Power
                    </p>
                    <Chip
                      size="sm"
                      color="secondary"
                      variant="flat"
                      className="h-5 text-[9px] font-black tracking-tighter uppercase px-1"
                    >
                      Influence
                    </Chip>
                    <Tooltip
                      content={
                        <div className="px-1 py-2 max-w-xs">
                          <div className="text-small font-bold">
                            STEEM POWER
                          </div>
                          <div className="text-tiny text-default-500">
                            Influence tokens for post payouts and curation
                            rewards. Earns ~2.61% APR. Cannot be transferred
                            directly.
                          </div>
                        </div>
                      }
                    >
                      <Info
                        size={13}
                        className="text-muted cursor-help opacity-60 hover:opacity-100"
                      />
                    </Tooltip>
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-2xl font-black font-mono tracking-tight text-foreground">
                      {fmt(effectiveSP)}
                    </span>
                    <span className="text-xs text-secondary font-black">
                      SP
                    </span>
                    <span className="text-[10px] text-default-400 font-semibold uppercase tracking-wider">
                      Voting Weight
                    </span>
                  </div>
                </div>
              </div>

              {/* APR Badge */}
              <div className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-secondary/20 bg-secondary/5 text-secondary text-xs font-bold shrink-0 self-center">
                <Zap size={12} fill="currentColor" />
                <span>2.61% APR</span>
              </div>
            </div>

            {/* Stacked Proportions Bar */}
            {effectiveSP > 0 && (
              <div className="space-y-1.5">
                <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-default-100 dark:bg-default-800 gap-0.5">
                  <Tooltip
                    content={`Active Staked: ${fmt(ownSP - outSP, 0)} SP (${(((ownSP - outSP) / effectiveSP) * 100).toFixed(1)}%)`}
                  >
                    <div
                      className="bg-primary hover:opacity-90 transition-all cursor-pointer"
                      style={{
                        width: `${Math.max(0, ((ownSP - outSP) / effectiveSP) * 100)}%`,
                      }}
                    />
                  </Tooltip>
                  {inSP > 0 && (
                    <Tooltip
                      content={`Received Delegations: +${fmt(inSP, 0)} SP (${((inSP / effectiveSP) * 100).toFixed(1)}%)`}
                    >
                      <div
                        className="bg-success hover:opacity-90 transition-all cursor-pointer"
                        style={{ width: `${(inSP / effectiveSP) * 100}%` }}
                      />
                    </Tooltip>
                  )}
                </div>
                <div className="flex justify-between text-[10px] text-default-500 font-medium px-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    <span>
                      Active Staked:{" "}
                      <span className="font-bold text-foreground font-mono">
                        {fmt(ownSP - outSP, 0)}
                      </span>{" "}
                      SP
                    </span>
                  </div>
                  {inSP > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-success rounded-full" />
                      <span>
                        Received Delegations:{" "}
                        <span className="font-bold text-foreground font-mono">
                          +{fmt(inSP, 0)}
                        </span>{" "}
                        SP
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Visual Equation Breakdown */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3.5 bg-default-50/50 dark:bg-default-50/5 rounded-xl border border-default-200/50">
              {/* Own SP */}
              <Tooltip content="Steem Power you purchased or earned from rewards. It belongs fully to you.">
                <div className="flex-1 flex flex-row sm:flex-col items-center justify-between sm:justify-center p-2.5 bg-content1 border border-default-200 rounded-lg shadow-sm hover:border-primary/50 transition-all group cursor-help">
                  <div className="flex items-center gap-1.5 sm:flex-col">
                    <Landmark
                      size={16}
                      className="text-muted group-hover:text-primary transition-colors"
                    />
                    <span className="text-[10px] uppercase font-bold text-default-500 tracking-wider">
                      Own Staked
                    </span>
                  </div>
                  <span className="text-xs font-bold font-mono mt-0.5 text-foreground">
                    {fmt(ownSP, 0)} SP
                  </span>
                </div>
              </Tooltip>

              {/* Plus Sign */}
              <div
                className="text-sm font-bold text-success text-center self-center sm:px-1"
                title="Plus Received Delegations"
              >
                +
              </div>

              {/* Delegated In */}
              <Tooltip content="Steem Power lent to you by other users, which increases your active voting weight and resource credits.">
                <div className="flex-1 flex flex-row sm:flex-col items-center justify-between sm:justify-center p-2.5 bg-content1 border border-default-200 rounded-lg shadow-sm hover:border-success/50 transition-all group cursor-help">
                  <div className="flex items-center gap-1.5 sm:flex-col">
                    <ArrowDownToLine
                      size={16}
                      className="text-muted group-hover:text-success transition-colors"
                    />
                    <span className="text-[10px] uppercase font-bold text-default-500 tracking-wider">
                      Delegated In
                    </span>
                  </div>
                  <span className="text-xs font-bold font-mono mt-0.5 text-success">
                    +{fmt(inSP, 0)} SP
                  </span>
                </div>
              </Tooltip>

              {/* Minus Sign */}
              <div
                className="text-sm font-bold text-danger text-center self-center sm:px-1"
                title="Minus Lent Delegations"
              >
                -
              </div>

              {/* Delegated Out */}
              <Tooltip content="Steem Power you lent to other users, curation trails, or communities. This temporarily reduces your voting power.">
                <div className="flex-1 flex flex-row sm:flex-col items-center justify-between sm:justify-center p-2.5 bg-content1 border border-default-200 rounded-lg shadow-sm hover:border-danger/50 transition-all group cursor-help">
                  <div className="flex items-center gap-1.5 sm:flex-col">
                    <ArrowUpFromLine
                      size={16}
                      className="text-muted group-hover:text-danger transition-colors"
                    />
                    <span className="text-[10px] uppercase font-bold text-default-500 tracking-wider">
                      Delegated Out
                    </span>
                  </div>
                  <span className="text-xs font-bold font-mono mt-0.5 text-danger">
                    -{fmt(outSP, 0)} SP
                  </span>
                </div>
              </Tooltip>

              {/* Equal Sign */}
              <div className="text-sm font-bold text-secondary text-center self-center sm:px-1">
                =
              </div>

              {/* Effective SP */}
              <Tooltip content="Your active voting weight. This determines the exact size of your upvotes and curation earnings.">
                <div className="flex-1 flex flex-row sm:flex-col items-center justify-between sm:justify-center p-2.5 bg-secondary/5 border border-secondary/20 rounded-lg shadow-sm group cursor-help">
                  <div className="flex items-center gap-1.5 sm:flex-col">
                    <Zap
                      size={16}
                      fill="currentColor"
                      className="text-secondary"
                    />
                    <span className="text-[10px] uppercase font-bold text-secondary tracking-wider">
                      Voting Weight
                    </span>
                  </div>
                  <span className="text-xs font-black font-mono mt-0.5 text-secondary">
                    {fmt(effectiveSP, 0)} SP
                  </span>
                </div>
              </Tooltip>
            </div>

            {/* Additional Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Available SP Card */}
              <Tooltip content="Your owned Steem Power that is currently liquid and uncommitted. You can delegate or power down this amount anytime.">
                <div className="p-3.5 bg-default-100 dark:bg-default-50/10 rounded-xl border border-default-200/40 hover:border-secondary/40 transition-all cursor-help space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-default-500 uppercase tracking-wider">
                      Available to Delegate
                    </span>
                    <Zap size={13} className="text-secondary" />
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black font-mono text-foreground">
                      {fmt(availableSP, 0)}
                    </span>
                    <span className="text-xs text-default-400 font-bold">
                      SP
                    </span>
                  </div>
                </div>
              </Tooltip>

              {/* Expiring / Power Down Status Card */}
              {expiringCount > 0 ? (
                <Tooltip content="Staked delegations you cancelled that are currently returning to your account after the lockup cooldown period.">
                  <div className="p-3.5 bg-warning/5 rounded-xl border border-warning/20 hover:border-warning/40 transition-all cursor-help space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-warning uppercase tracking-wider">
                        Expiring Cooldown (5d)
                      </span>
                      <Clock size={13} className="text-warning" />
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-black font-mono text-warning">
                        {expiringCount}
                      </span>
                      <span className="text-xs text-warning/80 font-bold">
                        Delegations
                      </span>
                    </div>
                  </div>
                </Tooltip>
              ) : (
                <div className="p-3.5 bg-default-100 dark:bg-default-50/10 rounded-xl border border-default-200/40 opacity-60 flex flex-col justify-center space-y-1.5">
                  <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
                    Expiring Cooldown
                  </span>
                  <p className="text-xs font-semibold text-muted">
                    — No active returns
                  </p>
                </div>
              )}
            </div>

            {/* Active Power Down visual tracker (within SP card for consolidation) */}
            {account.powerdown > 0 && (
              <div className="p-3 bg-warning/5 dark:bg-warning/10 border border-warning/20 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-warning">
                  <span className="flex items-center gap-1.5 uppercase tracking-wide">
                    <ArrowDownLeft size={14} />
                    Active Power Down Payout
                  </span>
                  <span>
                    {fmt(vestsToSteem(account.powerdown_done), 0)} /{" "}
                    {fmt(vestsToSteem(account.powerdown), 0)} SP
                  </span>
                </div>
                <div className="w-full bg-default-100 dark:bg-default-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-warning h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (account.powerdown_done / account.powerdown) * 100)}%`,
                    }}
                  />
                </div>
                <p className="text-[10px] text-default-500 font-medium">
                  Converts your Steem Power back to liquid STEEM in weekly
                  installments.
                </p>
              </div>
            )}

            {/* SP actions */}
            {isMe && (
              <div className="flex gap-2.5 pt-1.5 flex-wrap sm:flex-nowrap">
                <Button
                  size="sm"
                  variant="flat"
                  color="secondary"
                  className="flex-1 font-bold text-xs h-9 uppercase tracking-wider"
                  startContent={<Zap size={14} />}
                  onPress={onPowerUp}
                >
                  Power Up
                </Button>
                <Button
                  size="sm"
                  variant="flat"
                  color="warning"
                  className="flex-1 font-bold text-xs h-9 uppercase tracking-wider"
                  startContent={<ArrowDownLeft size={14} />}
                  onPress={onPowerDown}
                >
                  Power Down
                </Button>
                <Button
                  size="sm"
                  variant="flat"
                  className="flex-1 font-bold text-xs h-9 uppercase tracking-wider border border-default-300"
                  startContent={<Users size={14} />}
                  onPress={onDelegate}
                >
                  Delegate
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

// ─── Sub-components ────────────────────────────────────────────────────────

function TokenPill({
  label,
  pct,
  color,
}: {
  label: string;
  pct: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${color} shrink-0`} />
      <span className="text-[11px] text-default-500 font-medium">
        {label}{" "}
        <span className="font-bold text-foreground">{pct.toFixed(2)}%</span>
      </span>
    </div>
  );
}

interface TokenCardProps {
  icon: React.ReactNode;
  iconClass: string;
  label: string;
  subtitle: string;
  amount: string;
  usdAmount: string | null;
  tooltip: string;
  savings: string | null;
  savingsLabel: string;
  savingsTooltip: string;
  actions: React.ReactNode;
  onWithdraw?: () => void;
}

function TokenCard({
  icon,
  iconClass,
  label,
  subtitle,
  amount,
  usdAmount,
  tooltip,
  savings,
  savingsLabel,
  savingsTooltip,
  actions,
  onWithdraw,
}: TokenCardProps) {
  return (
    <Card
      shadow="none"
      className="card border border-default-200 dark:border-default-100/40"
    >
      <CardBody className="p-4 space-y-0">
        {/* Token header */}
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-xl shrink-0 ${iconClass}`}>{icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold">{label}</p>
              <Chip
                size="sm"
                variant="flat"
                className="h-5 text-[10px] px-1.5 font-bold"
              >
                {subtitle}
              </Chip>
              <Tooltip
                content={
                  <div className="px-1 py-2 max-w-xs">
                    <div className="text-small font-bold">{label}</div>
                    <div className="text-tiny text-default-500">{tooltip}</div>
                  </div>
                }
              >
                <Info
                  size={13}
                  className="text-muted cursor-help opacity-50 hover:opacity-100 ml-auto shrink-0"
                />
              </Tooltip>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono">{amount}</span>
              {usdAmount && (
                <span className="text-xs text-default-400 font-medium">
                  ≈ {usdAmount}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Savings row — always shown */}
        <Divider className="my-3 bg-default-100 dark:bg-default-100/20" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {savings ? (
              <Tooltip content={savingsTooltip}>
                <div className="flex items-center gap-1.5 cursor-help">
                  <Landmark size={13} className="text-default-400" />
                  <span className="text-xs text-default-500">
                    {savingsLabel}:
                    <span className="font-semibold text-foreground ml-1 font-mono">
                      {savings}
                    </span>
                  </span>
                  <Info size={12} className="text-default-400 opacity-60" />
                </div>
              </Tooltip>
            ) : (
              <div className="flex items-center gap-1.5">
                <Landmark size={13} className="text-default-400" />
                <span className="text-xs text-default-500">
                  {savingsLabel}:{" "}
                  <span className="font-medium text-default-400">
                    — No savings
                  </span>
                </span>
              </div>
            )}
          </div>
          <div className="h-6">
            {savings && onWithdraw && (
              <Button
                size="sm"
                variant="flat"
                color="danger"
                className="h-6 min-w-0 px-2 text-[11px] font-bold"
                onPress={onWithdraw}
              >
                Withdraw
              </Button>
            )}
          </div>
        </div>

        {/* Context actions */}
        {actions}
      </CardBody>
    </Card>
  );
}
