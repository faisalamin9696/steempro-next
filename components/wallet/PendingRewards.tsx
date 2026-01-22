import { addLoginHandler } from "@/hooks/redux/reducers/LoginReducer";
import { useAppDispatch } from "@/hooks/redux/store";
import { useSteemUtils } from "@/hooks/useSteemUtils";
import { steemApi } from "@/libs/steem";
import { handleSteemError } from "@/utils/steemApiError";
import { Alert } from "@heroui/alert";
import { Button } from "@heroui/button";
import { DollarSign } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAccountsContext } from "../auth/AccountsContext";

interface PendingRewardsProps {
  account: AccountExt;
}

export const PendingRewards = ({ account }: PendingRewardsProps) => {
  const { vestsToSteem } = useSteemUtils();

  const rewardSteem = account.rewards_steem ?? 0;
  const rewardSbd = account.rewards_sbd ?? 0;
  const rewardVesting = account.rewards_vests ?? 0;
  const rewardSp = vestsToSteem(rewardVesting);

  const hasRewards = rewardSteem > 0 || rewardSbd > 0 || rewardSp > 0;
  const { data: session } = useSession();
  const [isPending, setIsPending] = useState(false);
  const dispatch = useAppDispatch();
  const { authenticateOperation } = useAccountsContext();
  const isMe = session?.user?.name === account.name;

  async function handleRedeem() {
    setIsPending(true);
    await handleSteemError(async () => {
      const { key, useKeychain } = await authenticateOperation("posting");
      await steemApi.claimReward(
        session?.user?.name!,
        account.rewards_steem,
        account.rewards_sbd,
        account.rewards_vests,
        key,
        useKeychain
      );

      dispatch(
        addLoginHandler({
          ...account,
          balance_sbd: account.balance_sbd + account.rewards_sbd,
          balance_steem: account.balance_steem + account.rewards_steem,
          vests_own: account.vests_own + account.rewards_vests,
          rewards_steem: 0,
          rewards_sbd: 0,
          rewards_vests: 0,
        })
      );
      toast.success("Rewards Claimed", {
        description: "Your pending rewards have been claimed",
      });
    }).finally(() => {
      setIsPending(false);
    });
  }

  if (!hasRewards) {
    return null;
  }

  return (
    <Alert
      color="success"
      variant="faded"
      title="Pending Rewards"
      icon={
        <div>
          <DollarSign />
        </div>
      }
      classNames={{ title: "font-semibold pb-2" }}
      hideIconWrapper
      endContent={
        isMe && (
          <Button
            onPress={handleRedeem}
            size="sm"
            variant="flat"
            color="success"
            isLoading={isPending}
          >
            Claim
          </Button>
        )
      }
      description={
        <div className="flex flex-row flex-wrap gap-2 text-sm text-muted">
          {rewardSteem > 0 && (
            <p className="flex flex-row items-center gap-1">
              <span className="text-primary text-lg">•</span>{" "}
              {rewardSteem.toFixed(3)} STEEM
            </p>
          )}
          {rewardSbd > 0 && (
            <p className="flex flex-row items-center gap-1">
              <span className="text-secondary text-lg">•</span>{" "}
              {rewardSbd.toFixed(3)} SBD
            </p>
          )}
          {rewardVesting > 0 && (
            <p className="flex flex-row items-center gap-1">
              <span className="text-success text-lg">•</span>{" "}
              {rewardSp.toLocaleString()} SP
            </p>
          )}
        </div>
      }
    />
  );
};
