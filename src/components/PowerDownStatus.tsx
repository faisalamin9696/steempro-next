import { useState } from "react";
import { Chip } from "@heroui/chip";
import { BsArrowDown } from "react-icons/bs";
import { Button } from "@heroui/button";
import { FaX } from "react-icons/fa6";
import { Spinner } from "@heroui/spinner";
import { useAppSelector } from "@/constants/AppFunctions";
import { useSession } from "next-auth/react";
import { vestToSteem } from "@/utils/helper/vesting";
import TimeAgoWrapper from "./wrappers/TimeAgoWrapper";
import PowerDownModal from "./PowerDownModal";

interface PowerDownStatusProps {
  account: AccountExt;
  onUpdate?: () => void;
}

const PowerDownStatus = ({ account, onUpdate }: PowerDownStatusProps) => {
  const globalData = useAppSelector((state) => state.steemGlobalsReducer.value);
  const { data: session } = useSession();
  const [powerDownModal, setPowerDownModal] = useState<{
    isOpen: boolean;
    cancel?: boolean;
  }>({
    isOpen: false,
  });

  if (!account) return null;

  const username = session?.user?.name;
  const vestingWithdrawRate = account.powerdown_rate || 0;
  const nextWithdrawal = new Date(account.next_powerdown);

  // Check if power down is active
  const isPowerDownActive =
    vestingWithdrawRate > 0 && nextWithdrawal > new Date("1970-01-01");

  // Check if current user is viewing their own account
  const isOwnAccount = username && account.name === username;

  const handleCancelPowerDown = async () => {
    if (!username || !isPowerDownActive) return;
    setPowerDownModal({ isOpen: true, cancel: true });
  };

  if (!isPowerDownActive) {
    return null; // Don't show anything if no active power down
  }

  return (
    <>
      <div className="flex flex-wrap gap-y-4 max-sm:items-start items-center justify-between bg-orange-100 border border-orange-200 rounded-lg p-3">
        <div className="flex flex-col items-start gap-2">
          <div className="flex flex-row max-sm:flex-col max-sm:items-start gap-2 items-center">
            <Chip
              color="secondary"
              variant="flat"
              className="bg-orange-200 text-orange-800"
            >
              <div className="flex flex-row items-center gap-2">
                <BsArrowDown className="w-3 h-3 mr-1" />
                Power Down Active
              </div>
            </Chip>

            <div className="text-orange-700 font-medium">
              <div className="flex gap-2 items-center">
                <p className="text-sm">
                  {vestToSteem(
                    account.powerdown_done,
                    globalData.steem_per_share
                  )?.toLocaleString()}
                  /
                  {vestToSteem(
                    account.powerdown,
                    globalData.steem_per_share
                  )?.toLocaleString()}{" "}
                  STEEM
                </p>
              </div>
            </div>
          </div>

          <div className="text-orange-700 opacity-85">
            <div className="flex flex-col gap-2 items-start">
              <div className="text-tiny flex items-center gap-1">
                <p>Next power down</p>
                <TimeAgoWrapper created={account.next_powerdown * 1000} />: ~
                {vestToSteem(
                  account.powerdown_rate,
                  globalData.steem_per_share
                )?.toLocaleString()}{" "}
                STEEM
              </div>
            </div>
          </div>
        </div>

        {isOwnAccount && (
          <Button
            onPress={handleCancelPowerDown}
            variant="bordered"
            size="sm"
            radius="sm"
            isDisabled={false}
            className="border-orange-300 text-orange-600 hover:bg-orange-200"
          >
            {false ? (
              <Spinner
                color="success"
                size="sm"
                className="h-[18px] w-[18px]"
              />
            ) : (
              <FaX size={12} />
            )}
            Cancel
          </Button>
        )}
      </div>

      {powerDownModal.isOpen && (
        <PowerDownModal
          isOpen={powerDownModal.isOpen}
          cancel={powerDownModal.cancel}
          onOpenChange={(isOpen) => setPowerDownModal({ isOpen: isOpen })}
        />
      )}
    </>
  );
};

export default PowerDownStatus;
