"use client";

import { Tabs, Tab } from "@heroui/tabs";
import React from "react";
import FeedPatternSwitch from "@/components/FeedPatternSwitch";
import { useDeviceInfo } from "@/hooks/useDeviceInfo";
import { FaFire } from "react-icons/fa";
import { MdNewLabel, MdWhatshot } from "react-icons/md";
import { FaCircleDollarToSlot } from "react-icons/fa6";
import { twMerge } from "tailwind-merge";
import Link from "next/link";
import { useParams } from "next/navigation";
import HomeTabPage from "./HomeTabPage";

export default function HomePage() {
  let { category } = useParams() as { category: string };
  category = category?.toLowerCase();
  const { isMobile } = useDeviceInfo();

  let categoryTabs = [
    {
      title: "Trending",
      key: "trending",
      children: <HomeTabPage />,
      icon: <FaFire size={22} />,
    },
    {
      title: "Hot",
      key: "hot",
      children: <HomeTabPage />,
      icon: <MdWhatshot size={22} />,
    },
    {
      title: "New",
      key: "created",
      children: <HomeTabPage />,
      icon: <MdNewLabel size={22} />,
    },
    {
      title: "Payout",
      key: "payout",
      children: <HomeTabPage />,
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
        defaultSelectedKey={`/${"trending"}`}
        selectedKey={category ? `/${category}` : "/trending"}
        classNames={{
          tabList: "max-sm:gap-0 main-tab-list",
          base: "",
        }}
      >
        {categoryTabs.map((tab) => (
          <Tab
            as={Link}
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
