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
  const effectiveSP =
    ownSP - vestsToSteem(account.powerdown_done) - outSP + inSP;
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
          <CardBody className="p-4 space-y-3">
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-secondary/10 text-secondary shrink-0">
                <Zap size={20} fill="currentColor" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-sm font-semibold">Steem Power</p>
                  <Tooltip
                    content={
                      <div className="px-1 py-2 max-w-xs">
                        <div className="text-small font-bold">STEEM POWER</div>
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
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-xl font-bold font-mono">
                    {fmt(effectiveSP)}
                  </span>
                  <span className="text-xs text-secondary font-bold">SP</span>
                  <span className="text-[11px] text-default-400">
                    (effective)
                  </span>
                </div>
              </div>
            </div>

            {/* SP breakdown */}
            <div className="rounded-lg bg-default-100 dark:bg-default-50/10 p-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
              <SpRow
                icon={<Landmark size={13} />}
                label="Own"
                value={`${fmt(ownSP, 0)} SP`}
                colorClass="text-default-600"
              />
              <SpRow
                icon={<ArrowDownToLine size={13} />}
                label="Delegated In"
                value={inSP > 0 ? `+${fmt(inSP, 0)} SP` : "—"}
                colorClass="text-success"
              />
              <SpRow
                icon={<ArrowUpFromLine size={13} />}
                label="Delegated Out"
                value={outSP > 0 ? `-${fmt(outSP, 0)} SP` : "—"}
                colorClass="text-danger"
              />
              <SpRow
                icon={<Zap size={13} />}
                label="Available"
                value={`${fmt(availableSP, 0)} SP`}
                colorClass="text-secondary"
                bold
              />
              {expiringCount > 0 && (
                <SpRow
                  icon={<Clock size={13} />}
                  label="Expiring (5d)"
                  value={`${expiringCount} deleg.`}
                  colorClass="text-warning"
                />
              )}
            </div>

            {/* SP actions */}
            {isMe && (
              <div className="flex gap-2 pt-1">
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
                <Button
                  size="sm"
                  variant="flat"
                  color="warning"
                  className="flex-1 font-semibold text-xs h-8"
                  startContent={<ArrowDownLeft size={14} />}
                  onPress={onPowerDown}
                >
                  Power Down
                </Button>
                <Button
                  size="sm"
                  variant="flat"
                  className="flex-1 font-semibold text-xs h-8"
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

function SpRow({
  icon,
  label,
  value,
  colorClass,
  bold,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  colorClass: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1.5 min-w-0">
        <span className={`shrink-0 ${colorClass}`}>{icon}</span>
        <span className="text-[11px] text-default-600 dark:text-default-400 truncate">
          {label}
        </span>
      </div>
      <span
        className={`text-[11px] font-mono shrink-0 ${colorClass} ${bold ? "font-bold" : "font-medium"}`}
      >
        {value}
      </span>
    </div>
  );
}
