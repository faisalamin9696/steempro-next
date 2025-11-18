"use client";

import { Tab, Tabs } from "@heroui/tabs";
import React from "react";
import FeedPatternSwitch from "@/components/FeedPatternSwitch";
import { useDeviceInfo } from "@/hooks/useDeviceInfo";
import { FaCircleDollarToSlot } from "react-icons/fa6";
import { MdWhatshot, MdNewLabel } from "react-icons/md";
import { twMerge } from "tailwind-merge";
import { useParams, useRouter } from "next/navigation";
import CategoryTabPage from "./CategoryTabPage";
import { FiTrendingUp } from "react-icons/fi";
import { getMetadata, updateMetadata } from "@/utils/metadata";

let iconSize = 20;

export default function CategoryPage() {
  let { category, tag } = useParams() as { category: string; tag: string };
  category = category?.toLowerCase();
  tag = tag?.toLowerCase();
  const { isMobile } = useDeviceInfo();
  const router = useRouter();

  let homeTabs = [
    {
      title: "Trending",
      key: "trending",
      children: <CategoryTabPage category="trending" />,
      icon: <FiTrendingUp size={iconSize} />,
    },
    {
      title: "Hot",
      key: "hot",
      children: <CategoryTabPage category="hot" />,
      icon: <MdWhatshot size={iconSize} />,
    },
    {
      title: "New",
      key: "created",
      children: <CategoryTabPage category="created" />,
      icon: <MdNewLabel size={iconSize} />,
    },
    {
      title: "Payout",
      key: "payout",
      children: <CategoryTabPage category="payout" />,
      icon: <FaCircleDollarToSlot size={iconSize} />,
    },
  ];

  return (
    <div className={twMerge("relative items-center flex-row w-full")}>
      <Tabs
        destroyInactiveTabPanel={false}
        size={"sm"}
        color={"secondary"}
        radius={isMobile ? "full" : "sm"}
        className="justify-center"
        defaultSelectedKey={category}
        items={homeTabs}
        onSelectionChange={(key) => {
          router.push(`/${key.toString()}/${tag}`);
          const { title, description } = getMetadata.category(
            key?.toString(),
            tag
          );
          updateMetadata({ title, description });
        }}
      >
        {(item) => (
          <Tab
            key={item.key}
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
        <div className="absolute  top-0 right-0 max-sm:hidden">
          <FeedPatternSwitch />
        </div>
      )}
    </div>
  );
}
