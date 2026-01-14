"use client";

import { useState } from "react";
import { steemApi } from "@/libs/steem";
import { handleSteemError } from "@/utils/steemApiError";
import { toast } from "sonner";
import SModal from "../ui/SModal";
import { Button, Alert } from "@heroui/react";
import { ShieldCheck } from "lucide-react";
import { useAccountsContext } from "../auth/AccountsContext";
import { useAppSelector } from "@/hooks/redux/store";
import SInput from "../ui/SInput";

interface RecoveryUpdateModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  currentRecovery?: string;
}

export default function RecoveryUpdateModal({
  isOpen,
  onOpenChange,
  currentRecovery,
}: RecoveryUpdateModalProps) {
  const [newRecovery, setNewRecovery] = useState("");
  const [isPending, setIsPending] = useState(false);
  const { authenticateOperation } = useAccountsContext();
  const loginData = useAppSelector((state) => state.loginReducer.value);

  const handleUpdateRecovery = async () => {
    if (!newRecovery) return;
    setIsPending(true);
    await handleSteemError(async () => {
      const { key, useKeychain } = await authenticateOperation("owner");
      await steemApi.changeRecoveryAccount(
        loginData.name,
        newRecovery,
        key,
        useKeychain
      );
      toast.success("Recovery Account Change Initiated", {
        description: `Request to change recovery account to @${newRecovery} has been broadcasted.`,
      });
      onOpenChange(false);
    }).finally(() => {
      setIsPending(false);
    });
  };

  return (
    <SModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={() => (
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} className="text-primary" />
          <span>Update Recovery Account</span>
        </div>
      )}
    >
      {() => (
        <div className="flex flex-col gap-4 py-4">
          <Alert
            color="warning"
            variant="flat"
            title="Important"
            description="Changing your recovery account is a sensitive operation. It takes 30 days to complete. You need your OWNER key to sign this operation."
          />

          <div className="space-y-1">
            <p className="text-sm text-muted">Current Recovery Account</p>
            <p className="font-semibold">@{currentRecovery || "None"}</p>
          </div>

          <SInput
            label="New Recovery Account"
            placeholder="e.g. steemcurator01"
            value={newRecovery}
            onValueChange={setNewRecovery}
            isDisabled={isPending}
            autoComplete="off"
            labelPlacement="outside"
          />

          <Button
            color="primary"
            className="w-full"
            onPress={handleUpdateRecovery}
            isLoading={isPending}
            isDisabled={!newRecovery || newRecovery === currentRecovery}
          >
            Update Recovery Account
          </Button>
        </div>
      )}
    </SModal>
  );
}
