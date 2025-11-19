"use client";

import { Tabs, Tab } from "@heroui/tabs";
import React from "react";
import FeedPatternSwitch from "@/components/FeedPatternSwitch";
import { useDeviceInfo } from "@/hooks/useDeviceInfo";
import { MdNewLabel, MdWhatshot } from "react-icons/md";
import { FaCircleDollarToSlot } from "react-icons/fa6";
import { twMerge } from "tailwind-merge";
import { useParams, usePathname } from "next/navigation";
import HomeTabPage from "./HomeTabPage";
import { FiTrendingUp } from "react-icons/fi";
import { getMetadata, updateMetadata } from "@/utils/metadata";
// import dynamic from "next/dynamic";
// const HomeCarousel = dynamic(
//   () => import("@/components/carousal/HomeCarousal"),
//   {
//     ssr: false, // Set to false if the component doesn't need server-side rendering
//   }
// );

let iconSize = 20;

export default function HomePage() {
  let { category } = useParams() as { category: string };
  category = category?.toLowerCase();
  const { isMobile } = useDeviceInfo();
  const pathname = usePathname()?.replace("/", "");

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
      {/* <HomeCarousel /> */}
      <Tabs
        destroyInactiveTabPanel={false}
        size={"sm"}
        color={"secondary"}
        radius={isMobile ? "full" : "sm"}
        className="justify-center"
        defaultSelectedKey={category}
        items={categoryTabs}
        selectedKey={pathname || "trending"}
        onSelectionChange={(key) => {
          window.history.pushState({}, "", `/${key.toString()}`);
          const { title, description } = getMetadata.home(key.toString());
          updateMetadata({ title, description });
        }}
      >
        {(item) => (
          <Tab
            key={`${item.key}`}
            title={
              <div className="flex items-center space-x-2">
                {item?.icon}
                <span>{item.title}</span>
              </div>
            }
          >
            {item.children}
          </Tab>
        )}
      </Tabs>

      {category !== "wallet" && (
        <div className="absolute  top-0 right-0">
          <FeedPatternSwitch />
        </div>
      )}
    </div>
  );
}
