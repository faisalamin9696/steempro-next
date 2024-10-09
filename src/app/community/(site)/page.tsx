"use client";

import { Tab, Tabs } from "@nextui-org/tabs";
import React from "react";
import usePathnameClient from "@/libs/utils/usePathnameClient";
import FeedPatternSwitch from "@/components/FeedPatternSwitch";
import CommunityPinnedTab from "../(tabs)/pinned/page";
import CommunityTrendingsTab from "../(tabs)/trendings/page";
import CommunityCreatedPage from "../(tabs)/created/page";
import { CommunityAboutTab } from "../(tabs)/about/CommunityAboutTab";

interface Props {
  data: Community;
}

export default function CommunityPage(props: Props) {
  const { data } = props;
  let { community, category } = usePathnameClient();

  const profileTabs = [
    { title: "Trending", key: "trending", children: <CommunityTrendingsTab /> },
    { title: "New", key: "created", children: <CommunityCreatedPage /> },
    { title: "Pinned", key: "pinned", children: <CommunityPinnedTab /> },
    {
      title: "About",
      key: "about",
      children: <CommunityAboutTab community={data} />,
    },
  ];

  return (
    <div className="relative items-center flex-row w-full">
      <Tabs
        size="sm"
        disableAnimation
        disableCursorAnimation
        color={"secondary"}
        radius="full"
        className="justify-center"
        defaultSelectedKey={category ?? "trendings"}
        onSelectionChange={(key) => {
          if (!category) history.replaceState({}, "", `/${key}/${community}`);
          else history.pushState({}, "", `/${key}/${community}`);
        }}
        classNames={{
          tabList: "max-sm:gap-0 main-tab-list",
          tab: "max-sm:max-w-prose max-sm:px-2 max-sm:h-5",
        }}
      >
        {profileTabs.map((tab) => (
          <Tab key={tab.key} title={tab.title}>
            {tab.children}
          </Tab>
        ))}
      </Tabs>

      {category !== "about" && (
        <div className="absolute  top-0 right-0 max-sm:hidden">
          <FeedPatternSwitch />
        </div>
      )}
    </div>
  );
}
