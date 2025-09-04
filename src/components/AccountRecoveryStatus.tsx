import { useEffect, useState } from "react";
import { Chip } from "@heroui/chip";
import { BsExclamationTriangle } from "react-icons/bs";
import { Button } from "@heroui/button";
import { useSession } from "next-auth/react";
import { useAccountRecoveryData } from "@/hooks/useAccountRecoveryData";
import moment from "moment";
import SLink from "./ui/SLink";
import { useDisclosure } from "@heroui/modal";
import AccountRecoveryModal from "./AccountRecoveryModal";

interface AccountRecoveryStatusProps {
  account: AccountExt;
}

const DAYS_TO_HIDE = 5;

const AccountRecoveryStatus = ({ account }: AccountRecoveryStatusProps) => {
  const { data: session } = useSession();
  const { recoveryData } = useAccountRecoveryData(account.name);
  const [showWarning, setShowWarning] = useState(true);
  const recoveryDisclosure = useDisclosure();

  useEffect(() => {
    if (!account || !session?.user?.name) return;

    const username = session.user.name;
    const storageKey = `recovery_check_${username}`;
    const storedData = localStorage.getItem(storageKey);

    if (storedData) {
      const { recovery_account, timestamp } = JSON.parse(storedData);

      // If recovery account changed since dismissal, clear storage
      if (recovery_account !== account.recovery_account) {
        localStorage.removeItem(storageKey);
        return;
      }

      const now = new Date();
      const dismissalDate = new Date(timestamp);
      const diffDays = moment(now).diff(moment(dismissalDate), "days");

      if (diffDays <= DAYS_TO_HIDE) {
        setShowWarning(false);
      } else {
        localStorage.removeItem(storageKey);
      }
    }
  }, [account, session]);

  if (!account || account.name !== session?.user?.name) return null;

  if (!recoveryData || !showWarning) {
    return null;
  }

  const username = session?.user?.name;
  const currentRecoveryAccount = account.recovery_account;
  const daysLeft = Math.ceil(
    moment(recoveryData.effective_on).diff(moment(), "d", true)
  );
  const pendingRecoveryAccount = recoveryData.recovery_account;

  // Check if current user is viewing their own account
  // const isOwnAccount = username && account.name === username;
  const isOwnAccount = true;

  const handleDismiss = () => {
    if (!username) return;

    const storageKey = `recovery_check_${username}`;
    const dismissalData = {
      recovery_account: account.recovery_account,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem(storageKey, JSON.stringify(dismissalData));
    setShowWarning(false);
  };

  const handleTakeAction = () => {
    recoveryDisclosure.onOpen();
  };

  return (
    <>
      <div className="flex flex-wrap gap-y-4 max-sm:items-start items-start justify-between bg-red-100 border border-red-200 rounded-lg p-3">
        <div className="flex flex-col items-start gap-2">
          <div className="flex flex-col max-sm:flex-col max-sm:items-start gap-2 items-start">
            <Chip
              color="danger"
              variant="flat"
              className="bg-red-200 text-red-800"
            >
              <div className="flex flex-row items-center gap-2">
                <BsExclamationTriangle className="w-3 h-3 mr-1" />
                Recovery Account Changing
              </div>
            </Chip>

            <div className="text-yellow-700 font-medium">
              <div className="flex gap-2 items-center">
                <p className="flex flex-row text-sm gap-2">
                  Current:
                  <SLink href={`/@${currentRecoveryAccount}`}>
                    {currentRecoveryAccount}
                  </SLink>
                  → New:{" "}
                  <SLink href={`/@${pendingRecoveryAccount}`}>
                    {pendingRecoveryAccount}
                  </SLink>
                </p>
              </div>
            </div>
          </div>

          <div
            className="text-red-700 opacity-85"
            title={recoveryData.effective_on}
          >
            <div className="flex flex-col gap-2 items-start">
              <div className="text-tiny flex items-center gap-1">
                <p>
                  Time remaining: {daysLeft} day{daysLeft !== 1 ? "s" : ""}
                </p>
                {daysLeft <= 7 && (
                  <span className="font-bold">(Action required!)</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {isOwnAccount && (
            <Button
              onPress={handleTakeAction}
              variant="solid"
              size="sm"
              radius="sm"
              color="danger"
              className="text-white"
            >
              Take Action
            </Button>
          )}
          <Button
            onPress={handleDismiss}
            variant="bordered"
            size="sm"
            radius="sm"
            className="border-red-300 text-red-600 hover:bg-red-200"
          >
            Dismiss
          </Button>
        </div>
      </div>

      <AccountRecoveryModal
        isOpen={recoveryDisclosure.isOpen}
        onOpenChange={recoveryDisclosure.onOpenChange}
        account={account}
        pendingAccount={recoveryData.recovery_account}
      />
    </>
  );
};

export default AccountRecoveryStatus;
