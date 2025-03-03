"use client";

import { Tab, Tabs } from "@heroui/tabs";
import React from "react";
import usePathnameClient from "@/libs/utils/usePathnameClient";
import FeedPatternSwitch from "@/components/FeedPatternSwitch";
import clsx from "clsx";
import CategoryTrendingsTab from "./(tabs)/trendings/page";
import CategoryCreatedTab from "./(tabs)/created/page";
import CategoryPayoutTab from "./(tabs)/payout/page";
import CategoryHotTab from "./(tabs)/hot/page";
import { useDeviceInfo } from "@/libs/utils/useDeviceInfo";
import { FaFire } from "react-icons/fa";
import { FaCircleDollarToSlot } from "react-icons/fa6";
import { MdWhatshot, MdNewLabel } from "react-icons/md";

export default function CategoryPage() {
  let { category, tag } = usePathnameClient();
  const { isMobile } = useDeviceInfo();

  let homeTabs = [
    {
      title: "Trending",
      key: "trending",
      children: <CategoryTrendingsTab />,
      icon: <FaFire size={22} />,
    },
    {
      title: "Hot",
      key: "hot",
      children: <CategoryHotTab />,
      icon: <MdWhatshot size={22} />,
    },
    {
      title: "New",
      key: "created",
      children: <CategoryCreatedTab />,
      icon: <MdNewLabel size={22} />,
    },
    {
      title: "Payout",
      key: "payout",
      children: <CategoryPayoutTab />,
      icon: <FaCircleDollarToSlot size={22} />,
    },
  ];

  return (
    <div className={clsx("relative items-center flex-row w-full")}>
      <Tabs
        destroyInactiveTabPanel={false}
        size={"sm"}
        color={"secondary"}
        disableAnimation={isMobile}
        radius={isMobile ? "full" : "sm"}
        className="justify-center"
        defaultSelectedKey={category}
        selectedKey={`/${category}/${tag}`}
        classNames={{
          tabList: "max-sm:gap-0 main-tab-list",
          tab: "max-sm:px-2 max-sm:h-5",
          base: "",
        }}
      >
        {homeTabs.map((tab) => (
          <Tab
            href={`/${tab.key}/${tag}`}
            key={`/${tab.key}/${tag}`}
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
