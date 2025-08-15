"use client";

import React from "react";
import { Tab, Tabs } from "@heroui/tabs";
import { useDeviceInfo } from "@/hooks/useDeviceInfo";
import { twMerge } from "tailwind-merge";
import SubscriptionTab from "./SubscriptionTab";
import ProfileTabPage from "../ProfileTabPage";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  username: string;
  tab: string;
}

export default function CommunitiesTab(props: Props) {
  const { username, tab } = props;
  const { t } = useLanguage();
  
  const profileTabs = [
    {
      title: t("profile.feed"),
      key: "feed",
      children: <ProfileTabPage />,
    },
    {
      title: t("profile.subscriptions"),
      key: "subscriptions",
      children: <SubscriptionTab />,
    },
  ];

  const { isMobile } = useDeviceInfo();

  return (
    <div className={twMerge("relative items-center flex-row w-full")}>
      <Tabs
        size="sm"
        color={"secondary"}
        disableAnimation={isMobile}
        variant={"underlined"}
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
