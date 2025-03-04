"use client";

import { Button } from "@heroui/button";
import React from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import NotificationsTable from "./NotificationsTable";
import { useAppSelector } from "@/libs/constants/AppFunctions";

interface Props {
  username: string | null;
  onOpen: boolean;
  onClose: () => void;
}

export default function NotificationsModal(props: Props) {
  const { username, onOpen, onClose } = props;
  if (!username) return null;

  const loginInfo = useAppSelector((state) => state.loginReducer.value);

  return (
    <Modal
      isOpen={onOpen}
      onClose={onClose}
      className=" mt-4"
      scrollBehavior="inside"
      hideCloseButton
      backdrop="opaque"
      size="lg"
      placement="top-center"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 justify-between">
              <div className=" flex flex-row gap-2 items-center text-center">
                <p>Notifications</p>
                {!!loginInfo.unread_count && (
                  <div className="relative max-w-fit min-w-min inline-flex items-center justify-between box-border whitespace-nowrap px-1 h-6 text-tiny rounded-full bg-default/40 text-default-700">
                    <span className="flex-1 text-inherit font-normal px-1">
                      {loginInfo.unread_count}
                    </span>
                  </div>
                )}
              </div>
            </ModalHeader>
            <ModalBody className=" pb-4">
              <NotificationsTable username={username} onClose={onClose} />
            </ModalBody>

            <ModalFooter>
              <Button color="danger" variant="flat" onPress={onClose} size="sm">
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
