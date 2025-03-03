import { useAppSelector } from "@/libs/constants/AppFunctions";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import React, { useState } from "react";
import { useSession } from "next-auth/react";

interface Props {
  proposalId: number;
  isOpen: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}
export default function AddRoleModal(props: Props) {
  let { proposalId } = props;
  const { isOpen, onOpenChange } = useDisclosure();
  const { data: session } = useSession();
  let [username, setUsername] = useState("");

  const loginInfo = useAppSelector((state) => state.loginReducer.value);

  return (
    <Modal
      isOpen={props.isOpen ?? isOpen}
      hideCloseButton
      onOpenChange={props.onOpenChange ?? onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Set role, title
            </ModalHeader>
            <ModalBody></ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="primary">Update</Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
