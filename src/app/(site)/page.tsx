"use client";

import { Tabs, Tab } from "@heroui/tabs";
import React from "react";
import usePathnameClient from "@/libs/utils/usePathnameClient";
import FeedPatternSwitch from "@/components/FeedPatternSwitch";
import HomeTrendingsTab from "./(tabs)/trendings/page";
import HomeCreatedTab from "./(tabs)/created/page";
import HomePayoutTab from "./(tabs)/payout/page";
import HomeHotTab from "./(tabs)/hot/page";
import { useDeviceInfo } from "@/libs/utils/useDeviceInfo";
import { FaFire } from "react-icons/fa";
import { MdNewLabel, MdWhatshot } from "react-icons/md";
import { FaCircleDollarToSlot } from "react-icons/fa6";
import { twMerge } from "tailwind-merge";

export default function HomePage() {
  let { category } = usePathnameClient();
  const { isMobile } = useDeviceInfo();

  let categoryTabs = [
    {
      title: "Trending",
      key: "trending",
      children: <HomeTrendingsTab />,
      icon: <FaFire size={22} />,
    },
    {
      title: "Hot",
      key: "hot",
      children: <HomeHotTab />,
      icon: <MdWhatshot size={22} />,
    },
    {
      title: "New",
      key: "created",
      children: <HomeCreatedTab />,
      icon: <MdNewLabel size={22} />,
    },
    {
      title: "Payout",
      key: "payout",
      children: <HomePayoutTab />,
      icon: <FaCircleDollarToSlot size={22} />,
    },
  ];

  return (
    <div className={twMerge("relative items-center flex-row w-full")}>
      <Tabs
        size={"sm"}
        disableAnimation={isMobile}
        color={"secondary"}
        radius={isMobile ? "full" : "sm"}
        className="justify-center"
        defaultSelectedKey={category ?? "trending"}
        selectedKey={`/${category}`}
        onSelectionChange={(key) => {
          if (!category) history.replaceState({}, "", `${key}`);
          // else history.pushState({}, "", `/${key}`);
        }}
        classNames={{
          tabList: "max-sm:gap-0 main-tab-list",
          base: "",
        }}
      >
        {categoryTabs.map((tab) => (
          <Tab
            href={`/${tab.key}`}
            key={`/${tab.key}`}
            title={
              <div className="flex items-center space-x-2">
                {!isMobile && tab?.icon}
                <span>{tab.title}</span>
              </div>
            }
          >
            {tab.children}
          </Tab>
        ))}
      </Tabs>

      {category !== "wallet" && (
        <div className="absolute  top-0 right-0 max-sm:hidden">
          <FeedPatternSwitch />
        </div>
      )}
    </div>
  );
}
