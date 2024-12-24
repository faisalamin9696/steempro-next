"use client";

import React from "react";
import { Tab, Tabs } from "@nextui-org/tabs";
import { clsx } from "clsx";
import ProfileCommunitiesTab from "../communities/page";
import ProfileSubsribtionsTab from "../subscriptions/page";
import { useDeviceInfo } from "@/libs/utils/useDeviceInfo";

export default function ProfileCommunitiesMainTab() {
  const profileTabs = [
    { title: "Feed", key: "feed", children: <ProfileCommunitiesTab /> },
    {
      title: "Subscriptions",
      key: "subscriptions",
      children: <ProfileSubsribtionsTab />,
    },
  ];

  const { isMobile } = useDeviceInfo();

  return (
    <div className={clsx("relative items-center flex-row w-full")}>
      <Tabs
        size="sm"
        color={"primary"}
        disableAnimation
        disableCursorAnimation
        variant={isMobile ? "underlined" : "solid"}
        radius={isMobile ? "full" : "sm"}
        className="justify-center"
        classNames={{
          tabList: "max-sm:gap-0 max-sm:bg-transparent max-sm:p-0",
          tab: "max-sm:max-w-prose max-sm:px-2 max-sm:h-5",
        }}
      >
        {profileTabs.map((tab) => (
          <Tab key={tab.key} title={tab.title}>
            {tab.children}
          </Tab>
        ))}
      </Tabs>
    </div>
  );
}
