"use client";

import { Button } from "@nextui-org/button";
import React, {  } from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalFooter,
} from "@nextui-org/modal";
import NotificationsTable from "./NotificationsTable";

interface Props {
  username: string | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function NotificationsModal(props: Props) {
  const { username } = props;

  if (!username) return null;
  // let [offset, setOffset] = useState(20);

  return (
    <Modal
      isOpen={props.isOpen}
      onOpenChange={props.onOpenChange}
      className=" mt-4"
      scrollBehavior="inside"
      hideCloseButton
      backdrop="blur"
      size="lg"
      placement="top-center"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Notifications
            </ModalHeader>
            <ModalBody id="scrollDiv" className=" pb-4">
              <NotificationsTable username={username} />
            </ModalBody>

            <ModalFooter>
              <Button color="danger" variant="flat" onClick={onClose} size="sm">
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
