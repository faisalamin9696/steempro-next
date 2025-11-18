"use client";

import { Tabs, Tab } from "@heroui/tabs";
import React, { useState } from "react";
import FeedPatternSwitch from "@/components/FeedPatternSwitch";
import { useDeviceInfo } from "@/hooks/useDeviceInfo";
import { MdNewLabel, MdWhatshot } from "react-icons/md";
import { FaCircleDollarToSlot } from "react-icons/fa6";
import { twMerge } from "tailwind-merge";
import { useParams, useRouter } from "next/navigation";
import HomeTabPage from "./HomeTabPage";
import { FiTrendingUp } from "react-icons/fi";
import { getMetadata, updateMetadata } from "@/utils/metadata";

let iconSize = 20;

export default function HomePage() {
  let { category } = useParams() as { category: string };
  category = category?.toLowerCase();
  const { isMobile } = useDeviceInfo();
  const [selectedKey, setSelectedKey] = useState(category);
  const router = useRouter();

  let categoryTabs = [
    {
      title: "Trending",
      key: "trending",
      children: <HomeTabPage category="trending" />,
      icon: <FiTrendingUp size={iconSize} />,
    },
    {
      title: "Hot",
      key: "hot",
      children: <HomeTabPage category="hot" />,
      icon: <MdWhatshot size={iconSize} />,
    },
    {
      title: "New",
      key: "created",
      children: <HomeTabPage category="created" />,
      icon: <MdNewLabel size={iconSize} />,
    },
    {
      title: "Payout",
      key: "payout",
      children: <HomeTabPage category="payout" />,
      icon: <FaCircleDollarToSlot size={iconSize} />,
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
        defaultSelectedKey={`/${"trending"}`}
        classNames={{
          tabList: "max-sm:gap-0 main-tab-list",
          base: "",
        }}
        items={categoryTabs}
        selectedKey={selectedKey}
        onSelectionChange={(key) => {
          setSelectedKey(key?.toString());
          router.push(`/${key.toString()}`);
          const { title, description } = getMetadata.home(key.toString());
          updateMetadata({ title, description });
        }}
      >
        {categoryTabs.map((tab) => (
          <Tab
            key={`${tab.key}`}
            title={
              <div className="flex items-center space-x-2">
                {tab?.icon}
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
