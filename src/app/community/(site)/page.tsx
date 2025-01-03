"use client";

import { Tab, Tabs } from "@nextui-org/tabs";
import React from "react";
import usePathnameClient from "@/libs/utils/usePathnameClient";
import FeedPatternSwitch from "@/components/FeedPatternSwitch";
import CommunityTrendingsTab from "../(tabs)/trendings/page";
import CommunityCreatedTab from "../(tabs)/created/page";
import { CommunityAboutTab } from "../(tabs)/about/CommunityAboutTab";
import { useDeviceInfo } from "@/libs/utils/useDeviceInfo";
import { MdInfo, MdNewLabel } from "react-icons/md";
import { FaFire } from "react-icons/fa";
import { RiUserStarFill } from "react-icons/ri";
import { CommunityRolesTab } from "../(tabs)/roles/CommunityRolesTab";

interface Props {
  data: Community;
}

export default function CommunityPage(props: Props) {
  const { data } = props;
  let { community, category } = usePathnameClient();
  const { isMobile } = useDeviceInfo();

  const profileTabs = [
    {
      title: "Trending",
      key: "trending",
      children: <CommunityTrendingsTab />,
      icon: <FaFire size={24} />,
    },
    {
      title: "New",
      key: "created",
      children: <CommunityCreatedTab />,
      icon: <MdNewLabel size={24} />,
    },
    {
      title: "Roles",
      key: "roles",
      children: <CommunityRolesTab community={data} />,
      icon: <RiUserStarFill size={24} />,
    },

    // { title: "Pinned", key: "pinned", children: <CommunityPinnedTab /> },
    {
      title: "About",
      key: "about",
      children: <CommunityAboutTab community={data} />,
      icon: <MdInfo size={24} />,
    },
  ];

  return (
    <div className="relative items-center flex-row w-full">
      <Tabs
        destroyInactiveTabPanel={false}
        size={isMobile ? "sm" : "md"}
        isVertical={!isMobile}
        color={"secondary"}
        radius={isMobile ? "full" : "sm"}
        className="justify-center"
        defaultSelectedKey={category ?? "trendings"}
        onSelectionChange={(key) => {
          if (!category) history.replaceState({}, "", `/${key}/${community}`);
          else history.pushState({}, "", `/${key}/${community}`);
        }}
        classNames={{
          tabList: "max-sm:gap-0 main-tab-list",
          tab: "max-sm:max-w-prose max-sm:px-2 max-sm:h-5",
          panel: "w-full",
          tabContent: " w-full",
        }}
      >
        {profileTabs.map((tab) => (
          <Tab
            key={tab.key}
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
  );
}
