import React, { useState } from "react";
import SModal from "./ui/SModal";
import { Input } from "@heroui/input";
import { Checkbox } from "@heroui/checkbox";
import { Button } from "@heroui/button";
import { useLogin } from "./auth/AuthProvider";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { updateAccountRecovery } from "@/libs/steem/condenser";
import { useAppSelector } from "@/constants/AppFunctions";
import { AsyncUtils } from "@/utils/async.utils";
import { mutate } from "swr";

interface Props {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  account: AccountExt;
  pendingAccount: string;
}

function AccountRecoveryModal(props: Props) {
  const { isOpen, onOpenChange, account, pendingAccount } = props;
  const { isAuthorizedActive, authenticateUserActive } = useLogin();
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const [newRecovery, setNewRecovery] = useState("");
  const [isConfirm, setIsConfirm] = useState(false);
  const isSelf = loginInfo.name === account.name;

  const mutateRecovery = useMutation({
    mutationFn: (data: {
      username: string;
      newRecovery: string;
      key: string;
    }) =>
      Promise.all([
        updateAccountRecovery(data.username, data.newRecovery, data.key),
        AsyncUtils.sleep(3),
      ]),
    onSettled(data, error, variables, context) {
      if (error) {
        toast.error(error.message || JSON.stringify(error));
        return;
      }
      if (isSelf) mutate([`${account.name}-recovery`]);
      toast.success("Recovery account updated successfully");
    },
  });

  async function handleRecoveryUpdate() {
    const credentials = authenticateUserActive(false, "OWNER");
    if (!isAuthorizedActive(credentials?.key)) {
      return;
    }
    if (!credentials?.key) {
      toast.error("Invalid credentials");
      return;
    }

    mutateRecovery.mutate({
      username: account.name,
      newRecovery: newRecovery,
      key: credentials.key,
    });
  }

  return (
    <SModal
      modalProps={{ hideCloseButton: true, size: "xl", isDismissable: false }}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={() => "Change Recovery Account"}
      subTitle={() => (
        <span>
          Visit the{" "}
          <a
            className="hover:text-blue-500"
            href="https://steemitwallet.com/faq.html#What_is_a_recovery_account"
          >
            FAQ
          </a>{" "}
          for more details on the Recovery Account.
        </span>
      )}
      body={() => (
        <div className="flex flex-col gap-4">
          <Input
            label="Account"
            value={account.name || ""}
            isDisabled
            labelPlacement="outside"
            classNames={{ mainWrapper: "w-full" }}
            isRequired
          />

          <Input
            label="Current Recovery Account"
            value={account.recovery_account}
            isDisabled
            labelPlacement="outside"
            isRequired
          />

          <Input
            label="Pending Change"
            value={pendingAccount}
            isDisabled
            labelPlacement="outside"
            isRequired
          />

          <Input
            label="New Recovery Account"
            value={newRecovery}
            placeholder="Enter new recovery account..."
            onValueChange={setNewRecovery}
            labelPlacement="outside"
            classNames={{ mainWrapper: "w-full" }}
            isRequired
          />
          <Checkbox
            isSelected={isConfirm}
            isDisabled={!newRecovery || mutateRecovery.isPending}
            onValueChange={setIsConfirm}
          >
            Confirm Change Recovery Account
          </Checkbox>
        </div>
      )}
      footer={(onClose) => (
        <div className="flex flex-row gap-2">
          <Button
            onPress={onClose}
            color="danger"
            variant="light"
            isDisabled={mutateRecovery.isPending}
          >
            Cancel
          </Button>

          <Button
            onPress={handleRecoveryUpdate}
            color="primary"
            isLoading={mutateRecovery.isPending}
            isDisabled={!newRecovery || mutateRecovery.isPending || !isConfirm}
          >
            Update
          </Button>
        </div>
      )}
    />
  );
}

export default AccountRecoveryModal;
