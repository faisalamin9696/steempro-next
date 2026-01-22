import { addLoginHandler } from "@/hooks/redux/reducers/LoginReducer";
import { useAppDispatch } from "@/hooks/redux/store";
import { useSteemUtils } from "@/hooks/useSteemUtils";
import { steemApi } from "@/libs/steem";
import { handleSteemError } from "@/utils/steemApiError";
import { Progress } from "@heroui/progress";
import { Alert } from "@heroui/alert";
import { Button } from "@heroui/button";
import { ArrowDownCircle } from "lucide-react";
import moment from "moment";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";
import { useAccountsContext } from "../auth/AccountsContext";

interface PowerDownStatusProps {
  account: AccountExt;
}

export const PowerDownStatus = ({ account }: PowerDownStatusProps) => {
  const toWithdraw = account.powerdown ?? 0;
  const withdrawn = account.powerdown_done ?? 0;
  const isPoweringDown = toWithdraw > 0;
  const { data: session } = useSession();
  const isMe = session?.user?.name === account.name;
  const [isPending, setIsPending] = useState(false);
  const dispatch = useAppDispatch();
  const { vestsToSteem } = useSteemUtils();
  const { authenticateOperation } = useAccountsContext();

  if (!isPoweringDown) {
    return null;
  }

  const progress = toWithdraw > 0 ? (withdrawn / toWithdraw) * 100 : 0;
  const remaining = toWithdraw - withdrawn;

  async function handleCancelPowerdown() {
    setIsPending(true);
    await handleSteemError(async () => {
      const { key, useKeychain } = await authenticateOperation("active");
      await steemApi.powerDown(account.name, 0, key, useKeychain);
      toast.success("Cancelled", {
        description: "Power down has been cancelled",
      });

      dispatch(
        addLoginHandler({
          ...account,
          powerdown: 0,
          vests_own: account.vests_own - withdrawn,
        })
      );
    }).finally(() => {
      setIsPending(false);
    });
  }

  return (
    <Alert
      color="warning"
      variant="faded"
      title="Power Down Active"
      icon={
        <div>
          <ArrowDownCircle />
        </div>
      }
      classNames={{
        title: "font-semibold pb-2",
        description: twMerge("w-full", isMe && "pe-4"),
      }}
      hideIconWrapper
      endContent={
        isMe && (
          <Button
            variant="flat"
            size="sm"
            color="warning"
            onPress={handleCancelPowerdown}
            isLoading={isPending}
          >
            Cancel
          </Button>
        )
      }
      description={
        <div className="space-y-2">
          <Progress value={progress} size="sm" color="warning" />
          <div className="flex flex-wrap gap-1.5 justify-between text-xs">
            <span className="text-muted">Remaining</span>

            <div>
              <span className="font-semibold">
                {vestsToSteem(remaining).toLocaleString()}
              </span>
              <span className="text-muted">
                {`/${vestsToSteem(toWithdraw).toLocaleString()}`}{" "}
              </span>
              STEEM
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 justify-between text-xs">
            <span className="text-muted">Next Withdrawal</span>

            <div className="flex flex-row gap-1">
              <span
                className="text-muted"
                title={moment.unix(account.next_powerdown).toLocaleString()}
              >
                ~ {vestsToSteem(account.powerdown_rate).toLocaleString()}
              </span>
              <span
                className="font-semibold"
                title={moment.unix(account.next_powerdown).toLocaleString()}
              >
                {moment.unix(account.next_powerdown).fromNow()}
              </span>
            </div>
          </div>
        </div>
      }
    />
  );
};
