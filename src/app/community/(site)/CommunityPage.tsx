"use client";

import { Tab, Tabs } from "@heroui/tabs";
import React, { useEffect } from "react";
import usePathnameClient from "@/libs/hooks/usePathnameClient";
import FeedPatternSwitch from "@/components/FeedPatternSwitch";
import CommunityTrendingsTab from "../(tabs)/trendings/page";
import CommunityCreatedTab from "../(tabs)/created/page";
import { CommunityAboutTab } from "../(tabs)/about/CommunityAboutTab";
import { useDeviceInfo } from "@/libs/hooks/useDeviceInfo";
import { MdInfo, MdNewLabel, MdPin } from "react-icons/md";
import { FaFire } from "react-icons/fa";
import CommunityPinnedTab from "../(tabs)/pinned/page";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface Props {
  data: Community;
  onLeadershipPress: () => void;
}

export default function CommunityPage(props: Props) {
  const { data, onLeadershipPress } = props;
  let { community, category } = usePathnameClient();
  const { isMobile, isBetween920AndMobile } = useDeviceInfo();
  const pathname = usePathname();

  const communityTabs = [
    {
      title: "Trending",
      key: "trending",
      children: <CommunityTrendingsTab />,
      icon: <FaFire size={22} />,
      priority: 1,
    },
    {
      title: "New",
      key: "created",
      children: <CommunityCreatedTab />,
      icon: <MdNewLabel size={22} />,
      priority: 2,
    },
  ];
  if (isMobile) {
    communityTabs.push({
      title: "Pinned",
      key: "pinned",
      children: <CommunityPinnedTab />,
      icon: <MdPin size={22} />,
      priority: 3,
    });
  }

  if (isBetween920AndMobile) {
    communityTabs.push({
      title: "About",
      key: "about",
      children: (
        <CommunityAboutTab
          onLeadershipPress={onLeadershipPress}
          community={data}
        />
      ),
      icon: <MdInfo size={22} />,
      priority: 5,
    });
  }
  const sortedCommunityTabs = communityTabs.sort(
    (a, b) => a.priority - b.priority
  );

  useEffect(() => {
    if (category === "roles") {
      onLeadershipPress();
    }
  }, []);

  return (
    <div className=" mt-4">
      <div className="relative items-center flex-row w-full">
        <Tabs
          destroyInactiveTabPanel={false}
          size={"sm"}
          disableAnimation={isMobile}
          color={"secondary"}
          radius={isMobile ? "full" : "sm"}
          className="justify-center"
          selectedKey={pathname}
          classNames={{
            tabList: "max-sm:gap-0 main-tab-list",
            panel: "w-full",
            tabContent: " w-full",
          }}
        >
          {sortedCommunityTabs.map((tab) => (
            <Tab
              as={Link}
              href={`/${tab.key}/${community}`}
              key={`/${tab.key}/${community}`}
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
        {!["about", "roles"].includes(category) && (
          <div className="absolute  top-0 right-0 max-sm:hidden">
            <FeedPatternSwitch />
          </div>
        )}
      </div>
    </div>
  );
}
