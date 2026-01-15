"use client";

import { Alert, Button } from "@heroui/react";
import { ArrowRight } from "lucide-react";
import { useAccountRecoveryData } from "@/hooks/useAccountRecoveryData";
import { useEffect, useState } from "react";
import moment from "moment";
import RecoveryUpdateModal from "./RecoveryUpdateModal";
import { useSession } from "next-auth/react";
import SUsername from "../ui/SUsername";

export const AccountRecoveryStatus = ({ account }: { account: AccountExt }) => {
  const { recoveryData } = useAccountRecoveryData(account.name);
  const [isDismissed, setIsDismissed] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const STORAGE_KEY = `recovery_alert_dismissed_${account.name}`;
  const { data: session } = useSession();
  const isMe = session?.user?.name === account.name;

  useEffect(() => {
    const dismissedAt = localStorage.getItem(STORAGE_KEY);
    if (!dismissedAt) {
      setIsDismissed(false);
      return;
    }

    const fiveDaysAgo = moment().subtract(5, "days");
    if (moment(parseInt(dismissedAt)).isBefore(fiveDaysAgo)) {
      setIsDismissed(false);
    } else {
      setIsDismissed(true);
    }
  }, [STORAGE_KEY, recoveryData]);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    setIsDismissed(true);
  };

  // If there is a pending recovery change
  if (recoveryData && !isDismissed) {
    return (
      <>
        <Alert
          color="danger"
          variant="faded"
          title="Account Recovery Update"
          classNames={{
            title: "font-semibold pb-2",
            description: "w-full",
          }}
          description={
            <div className="flex flex-row flex-wrap gap-2">
              <div className="flex flex-col gap-0.5 flex-1 w-full">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <SUsername
                    username={`@${account.recovery_account}`}
                    className="text-warning"
                  />
                  <ArrowRight size={14} className="text-muted" />
                  <SUsername
                    username={`@${recoveryData?.recovery_account}`}
                    className="text-warning"
                  />
                </div>
                <p className="text-xs text-muted">
                  Becomes effective on{" "}
                  {moment(recoveryData?.effective_on).format("LL")} (30-day
                  delay)
                </p>
              </div>

              {isMe && (
                <div className="flex flex-wrap gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="flat"
                    color="danger"
                    className="h-8 px-3"
                    onPress={() => setIsModalOpen(true)}
                  >
                    Change
                  </Button>

                  <Button size="sm" variant="flat" onPress={handleDismiss}>
                    Dismiss
                  </Button>
                </div>
              )}
            </div>
          }
        />
        <RecoveryUpdateModal
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          currentRecovery={account.recovery_account}
        />
      </>
    );
  }

  return null;
};
