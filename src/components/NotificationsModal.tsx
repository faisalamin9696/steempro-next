"use client";

import { Button } from "@heroui/button";
import React from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalFooter,
} from "@heroui/modal";
import { useAppSelector } from "@/libs/constants/AppFunctions";
import { Tab, Tabs } from "@heroui/tabs";
import { BsChatDots } from "react-icons/bs";
import { FaRegBell } from "react-icons/fa";
import { Badge } from "@heroui/badge";
import ChatNotificationsTable from "./chat/ChatNotificationTable";
import NotificationsTable from "./NotificationsTable";

interface Props {
  username: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function NotificationsModal(props: Props) {
  const { username, isOpen, onOpenChange } = props;
  if (!username) return null;
  const loginInfo = useAppSelector((state) => state.loginReducer.value);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
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
            {/* <ModalHeader className="flex flex-col gap-1 justify-between">
              <div className=" flex flex-row gap-2 items-center text-center">
                <p>Notifications</p>
              </div>
            </ModalHeader> */}
            <ModalBody className=" pb-4">
              <Tabs
                variant={"solid"}
                classNames={{
                  tabList: "gap-6 w-full relative rounded-none p-0",
                  cursor: "w-full bg-primary-300",
                  tab: " px-0 h-12",
                }}
              >
                <Tab
                  key="general"
                  title={
                    <div className="flex flex-row gap-2 items-center">
                      <p>General</p>
                      {!!loginInfo.unread_count && (
                        <Badge
                          color="primary"
                          variant="solid"
                          showOutline={false}
                          size="sm"
                          content={loginInfo.unread_count}
                        >
                          <FaRegBell size={18} />
                        </Badge>
                      )}
                    </div>
                  }
                >
                  <NotificationsTable {...props} />
                </Tab>
                <Tab
                  key="chat"
                  title={
                    <div className="flex flex-row gap-2 items-center">
                      <p>Chat</p>
                      <Badge
                        color="secondary"
                        variant="solid"
                        size="sm"
                        showOutline={false}
                        content={loginInfo.unread_count_chat}
                      >
                        <BsChatDots size={18} />
                      </Badge>
                    </div>
                  }
                >
                  <div className="flex flex-col gap-4 p-1">
                    <ChatNotificationsTable {...props} />
                  </div>
                </Tab>
              </Tabs>
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
