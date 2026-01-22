import { Card } from "@heroui/card";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Zap,
  TrendingUp,
  ArrowUpFromLine,
  ArrowDownToLine,
  Clock,
  Users,
} from "lucide-react";
import SCard from "../ui/SCard";
import { SteemIcon } from "../icons/SteemIcon";
import { useSteemUtils } from "@/hooks/useSteemUtils";
import { useSession } from "next-auth/react";

interface BalanceCardProps {
  account: AccountExt;
  onTransfer: () => void;
  onPowerUp: () => void;
  onPowerDown: () => void;
  onDelegate: () => void;
  expiringCount: number;
}

export const BalanceCard = ({
  account,
  onTransfer,
  onPowerUp,
  onPowerDown,
  onDelegate,
  expiringCount,
}: BalanceCardProps) => {
  const { data: session } = useSession();
  const isMe = session?.user?.name === account.name;
  const { vestsToSteem } = useSteemUtils();
  return (
    <SCard
      icon={TrendingUp}
      iconColor="primary"
      title="Wallet Balance"
      titleClass="font-semibold"
      classNames={{ body: "space-y-4" }}
      className="card"
      iconSize="sm"
      description="Manage your wallet balance"
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted">STEEM</p>
          <p className="font-semibold">
            {account.balance_steem.toLocaleString()}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted">SBD</p>
          <p className="font-semibold">
            {account.balance_sbd.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Savings */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted">Savings STEEM</p>
          <p className="font-semibold">
            {account.savings_steem.toLocaleString()}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted">Savings SBD</p>
          <p className="font-semibold">
            {account.savings_sbd.toLocaleString()}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-muted">Own Steem Power</p>
          <p className="font-semibold">
            {vestsToSteem(account.vests_own).toLocaleString()} SP
          </p>
        </div>
      </div>

      {/* Delegation Breakdown */}
      <Card
        shadow="none"
        className="p-4 rounded-lg bg-background/60 border border-border space-y-3"
      >
        <h4 className="text-sm font-semibold">Steem Power Breakdown</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-2">
            <ArrowUpFromLine className="text-danger" size={18} />
            <div>
              <p className="text-xs text-muted">Outgoing</p>
              <p className="text-sm font-medium">
                {vestsToSteem(account.vests_out)
                  ? `-${vestsToSteem(account.vests_out).toLocaleString()}`
                  : "-"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ArrowDownToLine className=" text-green-500" size={18} />
            <div>
              <p className="text-xs text-muted">Incoming</p>
              <p className="text-sm font-medium">
                {vestsToSteem(account.vests_in)
                  ? `+${vestsToSteem(account.vests_in).toLocaleString()}`
                  : "-"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className=" text-yellow-500" size={18} />
            <div>
              <p className="text-xs text-muted">Expiring (5d)</p>
              <p className="text-sm font-medium">
                {expiringCount
                  ? `${expiringCount} delegation${
                      expiringCount !== 1 ? "s" : ""
                    }`
                  : "-"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-md bg-primary/10">
            <SteemIcon className="text-primary" size={18} />
            <div>
              <p className="text-xs text-muted">Available SP</p>
              <p className="text-sm font-bold text-primary">
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
      </Card>
      <Divider />
      {session?.user?.name && (
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
      )}
    </SCard>
  );
};
