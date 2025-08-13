"use client";

import { Button } from "@heroui/button";
import React from "react";
import { useAppSelector } from "@/constants/AppFunctions";
import { Tab, Tabs } from "@heroui/tabs";
import { BsChatDots } from "react-icons/bs";
import { FaRegBell } from "react-icons/fa";
import { Badge } from "@heroui/badge";
import ChatNotificationsTable from "./chat/user/ChatNotificationTable";
import SModal from "./ui/SModal";
import NotificationsTable from "./NotificationsTable";

interface Props {
  username: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function NotificationsModal(props: Props) {
  const { username, isOpen, onOpenChange } = props;
  if (!username) return null;
  const commonData = useAppSelector((state) => state.commonReducer.values);

  return (
    <SModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      modalProps={{
        hideCloseButton: true,
        size: "lg",
        placement: "top",
        scrollBehavior: "inside",
      }}
      body={() => (
        <Tabs
          variant={"solid"}
          classNames={{
            tabList: "gap-4",
            cursor: "bg-primary-200",
          }}
        >
          <Tab
            key="general"
            title={
              <div className="flex flex-row gap-1 items-center">
                <p>General</p>
                <Badge
                  color="primary"
                  variant="solid"
                  shape="circle"
                  showOutline={false}
                  size="sm"
                  isInvisible={commonData.unread_count < 1}
                  content={
                    commonData.unread_count > 99
                      ? "99+"
                      : commonData.unread_count
                  }
                >
                  <FaRegBell className="m-1" size={18} />
                </Badge>
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
                  isInvisible={!commonData.unread_count_chat}
                  content={
                    commonData.unread_count_chat > 99
                      ? "99+"
                      : commonData.unread_count_chat
                  }
                >
                  <BsChatDots className="m-1" size={18} />
                </Badge>
              </div>
            }
          >
            <div className="flex flex-col gap-4 p-1">
              <ChatNotificationsTable {...props} />
            </div>
          </Tab>
        </Tabs>
      )}
      footer={(onClose) => (
        <Button color="danger" variant="flat" onPress={onClose}>
          Close
        </Button>
      )}
    />
  );
}
