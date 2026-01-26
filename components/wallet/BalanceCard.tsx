import { Card } from "@heroui/card";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Tooltip } from "@heroui/tooltip";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Zap,
  TrendingUp,
  ArrowUpFromLine,
  ArrowDownToLine,
  Clock,
  Users,
  CircleDollarSign,
  Info,
  Ellipsis,
} from "lucide-react";
import SCard from "../ui/SCard";
import { SteemIcon } from "../icons/SteemIcon";
import { useSteemUtils } from "@/hooks/useSteemUtils";
import { useSession } from "next-auth/react";
import { usePriceData } from "@/hooks/usePriceData";

interface BalanceCardProps {
  account: AccountExt;
  onTransfer: () => void;
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
  const { vestsToSteem, globalProps } = useSteemUtils();
  const { isLoading, steemUsd, sbdUsd, error } = usePriceData();

  // Calculate Estimated Account Value
  const totalSteemPrice =
    (account.balance_steem +
      account.savings_steem +
      vestsToSteem(account.vests_own)) *
    steemUsd;
  const totalSbdPrice = (account.balance_sbd + account.savings_sbd) * sbdUsd;

  const estimatedValue = totalSteemPrice + totalSbdPrice;

  return (
    <div className="space-y-6">
      <SCard
        icon={TrendingUp}
        iconColor="primary"
        title="Wallet Balance"
        titleClass="font-semibold"
        classNames={{ body: "space-y-6" }}
        className="card"
        iconSize="sm"
        description="Manage your wallet balance"
        titleEndContent={
          !isLoading &&
          !error && (
            <div className="flex flex-col items-end">
              <p className="text-xs text-muted">
                Est. Account Value
              </p>
              <p className="text-lg font-bold text-success">
                $
                {estimatedValue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          )
        }
      >
        <div className="grid gap-6">
          {/* STEEM & SBD Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* STEEM Card */}
            <div className="rounded-xl bg-default-50 border border-default-100 dark:border-default-50/50">
              <div className="p-4 flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                  <SteemIcon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <p className="text-sm font-medium text-muted">
                      STEEM
                    </p>
                    <Tooltip
                      content={
                        <div className="px-1 py-2 max-w-xs">
                          <div className="text-small font-bold">STEEM</div>
                          <div className="text-tiny text-default-500">
                            Tradeable tokens that may be transferred anywhere at
                            anytime. Steem can be converted to STEEM POWER in a
                            process called powering up.
                          </div>
                        </div>
                      }
                    >
                      <Info
                        size={14}
                        className="text-muted cursor-pointer opacity-50 hover:opacity-100"
                      />
                    </Tooltip>
                  </div>
                  <p className="font-semibold text-lg">
                    {account.balance_steem.toLocaleString()}
                  </p>
                  {account.savings_steem > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="inline-flex items-center text-xs font-medium text-default-500 bg-default-100 px-2 py-1 rounded-full cursor-help">
                        <Tooltip content="Balances subject to 3 day withdraw waiting period.">
                          <span className="flex items-center gap-1">
                            + {account.savings_steem.toLocaleString()} Savings
                            <Info size={12} className="opacity-50" />
                          </span>
                        </Tooltip>
                      </div>
                      {isMe && (
                        <Button
                          size="sm"
                          variant="flat"
                          color="danger"
                          className="h-6 min-w-0 px-2 text-xs"
                          onPress={() => onWithdrawSavings("STEEM")}
                        >
                          Withdraw
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SBD Card */}
            <div className="rounded-xl bg-default-50 border border-default-100 dark:border-default-50/50">
              <div className="p-4 flex items-start gap-4">
                <div className="p-3 bg-success/10 rounded-xl text-success">
                  <CircleDollarSign className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <p className="text-sm font-medium text-muted">
                      SBD
                    </p>
                    <Tooltip
                      content={
                        <div className="px-1 py-2 max-w-xs">
                          <div className="text-small font-bold">
                            Steem Dollars (SBD)
                          </div>
                          <div className="text-tiny text-default-500">
                            Tradeable tokens that may be transferred anywhere at
                            anytime. SBD can be converted to STEEM over 3.5
                            days. The amount received is based on the median
                            price feed from witnesses during that period. Final
                            results may vary due to price changes.
                          </div>
                        </div>
                      }
                    >
                      <Info
                        size={14}
                        className="text-muted cursor-pointer opacity-50 hover:opacity-100"
                      />
                    </Tooltip>
                  </div>
                  <p className="font-semibold text-lg">
                    {account.balance_sbd.toLocaleString()}
                  </p>
                  {account.savings_sbd > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="inline-flex items-center text-xs font-medium text-default-500 bg-default-100 px-2 py-1 rounded-full cursor-help">
                        <Tooltip content="Balances subject to 3 day withdraw waiting period.">
                          <span className="flex items-center gap-1">
                            + {account.savings_sbd.toLocaleString()} Savings
                            <Info size={12} className="opacity-50" />
                          </span>
                        </Tooltip>
                      </div>
                      {isMe && (
                        <Button
                          size="sm"
                          variant="flat"
                          color="danger"
                          className="h-6 min-w-0 px-2 text-xs"
                          onPress={() => onWithdrawSavings("SBD")}
                        >
                          Withdraw
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Steem Power Section */}
          <div className="rounded-xl border border-default-200 dark:border-default-100 overflow-hidden space-y-4">
            {/* Main SP Header */}
            <div className="flex bg-default-50/50 items-center gap-4 p-5">
              <div className="p-3 bg-secondary/10 rounded-xl text-secondary">
                <Zap className="w-6 h-6" fill="currentColor" />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:items-center justify-between">
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-medium text-muted">
                      Effective Power
                    </p>
                    <Tooltip
                      content={
                        <div className="px-1 py-2 max-w-xs">
                          <div className="text-small font-bold">
                            STEEM POWER
                          </div>
                          <div className="text-tiny text-default-500">
                            Influence tokens which give you more control over
                            post payouts and allow you to earn on curation
                            rewards. Part of {account.name}&apos;s STEEM POWER
                            is currently delegated. Delegation is donated for
                            influence or to help new users perform actions on
                            Steemit. Your delegation amount can fluctuate. STEEM
                            POWER increases at an APR of approximately 2.61%,
                            subject to blockchain.
                          </div>
                        </div>
                      }
                    >
                      <Info
                        size={14}
                        className="text-muted cursor-pointer opacity-50 hover:opacity-100"
                      />
                    </Tooltip>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-lg">
                      {(
                        vestsToSteem(account.vests_own) -
                        vestsToSteem(account.powerdown_done) -
                        vestsToSteem(account.vests_out) +
                        vestsToSteem(account.vests_in)
                      ).toLocaleString()}
                    </span>
                    <span className="text-sm font-medium text-muted">
                      SP
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Divider
                    className="h-10 hidden sm:block"
                    orientation="vertical"
                  />

                  <div className="sm:text-right">
                    <p className="text-xs text-muted">Own Power</p>
                    <p className="font-semibold text-lg">
                      {vestsToSteem(account.vests_own).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Delegation Breakdown (Previously separate card) */}
            <div className="p-4 bg-default-50/20 border-t border-default-200">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
                Delegation Details
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-md bg-danger/10 text-danger">
                    <ArrowUpFromLine size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-muted">Outgoing</p>
                    <p className="text-sm font-semibold">
                      {vestsToSteem(account.vests_out) > 0
                        ? `-${vestsToSteem(account.vests_out).toLocaleString()}`
                        : "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-md bg-success/10 text-green-600">
                    <ArrowDownToLine size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-muted">Incoming</p>
                    <p className="text-sm font-semibold">
                      {vestsToSteem(account.vests_in) > 0
                        ? `+${vestsToSteem(account.vests_in).toLocaleString()}`
                        : "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-md bg-warning/10 text-warning">
                    <Clock size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-muted">
                      Expiring (5d)
                    </p>
                    <p className="text-sm font-semibold">
                      {expiringCount > 0
                        ? `${expiringCount} delegation${
                            expiringCount !== 1 ? "s" : ""
                          }`
                        : "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-md bg-primary/10 text-primary">
                    <SteemIcon size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-muted">Available</p>
                    <p className="text-sm font-semibold text-primary">
                      {(
                        vestsToSteem(account.vests_own) -
                        vestsToSteem(account.vests_out) -
                        vestsToSteem(account.powerdown) +
                        vestsToSteem(account.powerdown_done)
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SCard>

      {session?.user?.name && (
        <SCard
        icon={Ellipsis}
          title="Quick Actions"
          iconColor="primary" // Reusing primary color for consistency
          titleClass="font-semibold"
          className="card"
          iconSize="sm"
        >
          <div className="flex flex-wrap gap-2">
            <Button
              onPress={onTransfer}
              variant="flat"
              color="primary"
              className="flex-1 min-w-[140px]"
            >
              <ArrowUpRight className="mr-2" size={18} />
              Transfer
            </Button>

            {isMe && (
              <>
                <Button
                  onPress={onPowerUp}
                  variant="flat"
                  color="secondary"
                  className="flex-1 min-w-[140px]"
                >
                  <Zap className="mr-2" size={18} />
                  Power Up
                </Button>

                <Button
                  onPress={onPowerDown}
                  variant="flat"
                  className="flex-1 min-w-[140px]"
                  color="warning"
                >
                  <ArrowDownLeft className="mr-2" size={18} />
                  Power Down
                </Button>

                <Button
                  onPress={onDelegate}
                  variant="flat"
                  className="flex-1 min-w-[140px]"
                >
                  <Users className="mr-2" size={18} />
                  Delegate
                </Button>
              </>
            )}
          </div>
        </SCard>
      )}
    </div>
  );
};
