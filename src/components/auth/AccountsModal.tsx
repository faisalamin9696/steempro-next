import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import React from "react";
import { useLogin } from "./AuthProvider";
import AvailableAccountList from "./AvailableAccountList";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  handleSwitchSuccess?: (User?: User) => void;
}

export default function AccountsModal(props: Props) {
  const { handleSwitchSuccess, isOpen, onClose } = props;
  const { authenticateUser } = useLogin();

  return (
    <Modal
      placement="top-center"
      className=" mt-4"
      isOpen={isOpen}
      onOpenChange={onClose}
      scrollBehavior={"inside"}
      hideCloseButton
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Accounts</ModalHeader>
            <ModalBody>
              <AvailableAccountList
                switchText="Switch"
                className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center"
                handleSwitchSuccess={(user) => {
                  onClose();
                  handleSwitchSuccess && handleSwitchSuccess(user);
                }}
              />
            </ModalBody>
            <ModalFooter>
              <Button
                color="primary"
                onPress={() => {
                  onClose();
                  authenticateUser(true);
                }}
              >
                Add Account
              </Button>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
