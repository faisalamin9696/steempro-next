"use client";

import React from "react";
import { Tab, Tabs } from "@heroui/tabs";
import { useDeviceInfo } from "@/hooks/useDeviceInfo";
import { twMerge } from "tailwind-merge";
import SubscriptionTab from "./SubscriptionTab";
import ProfileTabPage from "../ProfileTabPage";

interface Props {
  username: string;
  tab: string;
}

export default function CommunitiesTab(props: Props) {
  const { username, tab } = props;
  const communitiesTabs = [
    {
      title: "Feed",
      key: "feed",
      children: <ProfileTabPage tab="feed" username={username} />,
    },
    {
      title: "Subscriptions",
      key: "subscriptions",
      children: <SubscriptionTab username={username} />,
    },
  ];

  const { isMobile } = useDeviceInfo();

  return (
    <div className={twMerge("relative items-center flex-row w-full")}>
      <Tabs
        destroyInactiveTabPanel={false}
        size="sm"
        color={"secondary"}
        variant={"underlined"}
        radius={isMobile ? "full" : "sm"}
        className="justify-center"
        classNames={{
          tabList: "max-sm:gap-0 max-sm:bg-transparent max-sm:p-0",
        }}
        items={communitiesTabs}
      >
        {(item) => (
          <Tab key={item.key} title={item.title}>
            {item.children}
          </Tab>
        )}
      </Tabs>
    </div>
  );
}
