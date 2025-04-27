"use client";

import React from "react";
import { Tab, Tabs } from "@heroui/tabs";
import ProfileCommunitiesTab from "../communities/page";
import ProfileSubsribtionsTab from "../subscriptions/page";
import { useDeviceInfo } from "@/libs/hooks/useDeviceInfo";
import { twMerge } from "tailwind-merge";

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
    <div className={twMerge("relative items-center flex-row w-full")}>
      <Tabs
        size="sm"
        color={"primary"}
        disableAnimation={isMobile}
        variant={ "underlined"}
        radius={isMobile ? "full" : "sm"}
        className="justify-center"
        classNames={{
          tabList: "max-sm:gap-0 max-sm:bg-transparent max-sm:p-0",
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
