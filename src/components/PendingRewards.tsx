import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/constants/AppFunctions";
import { vestToSteem } from "@/utils/helper/vesting";
import { Chip } from "@heroui/chip";
import { FaGift } from "react-icons/fa";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import { useSession } from "next-auth/react";
import { useLogin } from "./auth/AuthProvider";
import { getCredentials, getSessionKey } from "@/utils/user";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { claimRewardBalance } from "@/libs/steem/condenser";
import { saveLoginHandler } from "@/hooks/redux/reducers/LoginReducer";

interface PendingRewardsProps {
  account: AccountExt;
  onUpdate?: () => void;
}

const PendingRewards = ({ account }: PendingRewardsProps) => {
  const [rewardSteemPower, setRewardSteemPower] = useState(0);
  const globalData = useAppSelector((state) => state.steemGlobalsReducer.value);
  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const { authenticateUser, isAuthorized } = useLogin();

  if (!account) return null;

  const username = session?.user?.name;
  const rewardSteem = account.rewards_steem || 0;
  const rewardSbd = account.rewards_sbd || 0;
  const rewardVests = account.rewards_vests || 0;

  // Check if current user is viewing their own account
  const isOwnAccount = username && account.name === username;

  // Check if there are any pending rewards
  const hasPendingRewards = rewardSteem > 0 || rewardSbd > 0 || rewardVests > 0;

  const claimMutation = useMutation({
    mutationFn: (data: { key: string; isKeychain?: boolean }) =>
      claimRewardBalance(
        account,
        data.key,
        account.rewards_steem,
        account.rewards_sbd,
        account.rewards_vests,
        data.isKeychain
      ),
    onSettled(data, error, variables, context) {
      if (error) {
        toast.error(error.message || JSON.stringify(error));
        return;
      }
      dispatch(
        saveLoginHandler({
          ...account,
          rewards_sbd: 0,
          rewards_steem: 0,
          rewards_vests: 0,
          balance_steem: account.balance_steem + account.rewards_steem,
          balance_sbd: account.balance_sbd + account.rewards_sbd,
          vests_own: account.vests_own + account.rewards_vests,
        })
      );
      toast.success("Reward claimed");
    },
  });

  async function handleClaimReward() {
    authenticateUser();
    if (!isAuthorized()) return;
    const credentials = getCredentials(getSessionKey(session?.user?.name));
    if (!credentials?.key) {
      toast.error("Invalid credentials");
      return;
    }

    claimMutation.mutate({
      key: credentials.key,
      isKeychain: credentials.keychainLogin,
    });
  }

  useEffect(() => {
    const convertRewardVestsToSteem = async () => {
      if (rewardVests > 0) {
        try {
          const steemPowerAmount = vestToSteem(
            rewardVests,
            globalData.steem_per_share
          );
          setRewardSteemPower(steemPowerAmount);
        } catch (error) {
          console.error("Error converting reward VESTS to STEEM:", error);
          // Fallback calculation
          setRewardSteemPower(rewardVests / 1000000);
        }
      }
    };

    convertRewardVestsToSteem();
  }, [rewardVests]);

  // Don't show if not own account or no pending rewards
  if (!hasPendingRewards) {
    return null;
  }

  return (
    <div className="flex gap-2 bg-success-50 border border-success-200 max-sm:items-start items-center justify-between rounded-lg px-2 py-3">
      <div className="flex max-sm:flex-col max-sm:items-start items-center gap-2">
        <Chip
          color="secondary"
          variant="flat"
          className="bg-green-100 text-green-800 hover:bg-green-100"
        >
          <div className="flex flex-row items-center gap-2">
            <FaGift size={16} />
            Pending Rewards
          </div>
        </Chip>

        <div className="flex items-center gap-1 text-sm">
          {rewardSteem > 0 && (
            <Chip
              size="sm"
              variant="dot"
              className="border-none"
              color="primary"
            >
              <span>{rewardSteem.toFixed(3)} STEEM</span>
            </Chip>
          )}

          {rewardSbd > 0 && (
            <Chip
              size="sm"
              variant="dot"
              className="border-none"
              color="secondary"
            >
              <span>{rewardSbd.toFixed(3)} SBD</span>
            </Chip>
          )}

          {rewardVests > 0 && (
            <Chip
              size="sm"
              variant="dot"
              className="border-none"
              color="success"
            >
              <span>{rewardSteemPower.toFixed(3)} SP</span>
            </Chip>
          )}
        </div>
      </div>

      {isOwnAccount && (
        <Button
          onPress={handleClaimReward}
          variant="bordered"
          size="sm"
          radius="sm"
          isDisabled={claimMutation.isPending}
          className="border-success-300 text-success-700 hover:bg-success-200"
        >
          {claimMutation.isPending ? (
            <Spinner color="success" size="sm" className="h-[18px] w-[18px]" />
          ) : (
            <FaGift size={14} />
          )}
          Redeem
        </Button>
      )}
    </div>
  );
};

export default PendingRewards;
