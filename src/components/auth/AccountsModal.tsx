import { Button } from "@heroui/button";
import React from "react";
import { useLogin } from "./AuthProvider";
import AvailableAccountList from "./AvailableAccountList";
import SModal from "../ui/SModal";

interface Props {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  handleSwitchSuccess?: (User?: User) => void;
}

export default function AccountsModal(props: Props) {
  const { handleSwitchSuccess, isOpen, onOpenChange } = props;
  const { authenticateUser } = useLogin();

  return (
    <SModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      modalProps={{ scrollBehavior: "inside", hideCloseButton: true }}
      title={() => "Accounts"}
      body={() => (
        <AvailableAccountList
          switchText="Switch"
          className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center"
          handleSwitchSuccess={(user) => {
            onOpenChange(false);
            handleSwitchSuccess && handleSwitchSuccess(user);
          }}
        />
      )}
      footer={(onClose) => (
        <>
          <Button color="danger" variant="light" onPress={onClose}>
            Cancel
          </Button>

          <Button
            color="primary"
            onPress={() => {
              onClose();
              authenticateUser(true);
            }}
          >
            Add Account
          </Button>
        </>
      )}
    />
  );
}
