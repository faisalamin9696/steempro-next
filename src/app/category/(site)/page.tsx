"use client";

import { Tab, Tabs } from "@nextui-org/tabs";
import React from "react";
import usePathnameClient from "@/libs/utils/usePathnameClient";
import FeedPatternSwitch from "@/components/FeedPatternSwitch";
import clsx from "clsx";
import CategoryTrendingsTab from "./(tabs)/trendings/page";
import CategoryCreatedTab from "./(tabs)/created/page";
import CategoryPayoutTab from "./(tabs)/payout/page";
import CategoryHotTab from "./(tabs)/hot/page";
import { useDeviceInfo } from "@/libs/utils/useDeviceInfo";

export default function CategoryPage() {
  let { category, tag } = usePathnameClient();
  const { isMobile } = useDeviceInfo();

  let homeTabs = [
    { title: "Trending", key: "trending", children: <CategoryTrendingsTab /> },
    { title: "Hot", key: "hot", children: <CategoryHotTab /> },
    { title: "New", key: "created", children: <CategoryCreatedTab /> },
    { title: "Payout", key: "payout", children: <CategoryPayoutTab /> },
  ];

  return (
    <div className={clsx("relative items-center flex-row w-full")}>
      <Tabs
        destroyInactiveTabPanel={false}
        size="sm"
        color={"secondary"}
        radius={isMobile ? "full" : "sm"}
        className="justify-center"
        defaultSelectedKey={category}
        onSelectionChange={(key) => {
          history.pushState({}, "", `/${key}/${tag}`);
        }}
        classNames={{
          tabList: "max-sm:gap-0 main-tab-list",
          tab: "max-sm:px-2 max-sm:h-5",
          base: "",
        }}
      >
        {homeTabs.map((tab) => (
          <Tab hidden key={tab.key} title={tab.title}>
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
