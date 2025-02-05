"use client";

import usePathnameClient from "@/libs/utils/usePathnameClient";
import React from "react";
import ProfileCommentsTab from "../comments/page";
import ProfileRepliesTab from "../replies/page";
import { Tab, Tabs } from "@heroui/tabs";
import { clsx } from "clsx";
import ProfilePostsTab from "../posts/page";
import ProfileFriendsTab from "../friends/page";
import { useDeviceInfo } from "@/libs/utils/useDeviceInfo";

export default function ProfilePostsMainTab() {
  let { username, category } = usePathnameClient();

  const profileTabs = [
    { title: "Posts", key: "posts", children: <ProfilePostsTab /> },
    { title: "Friends", key: "friends", children: <ProfileFriendsTab /> },
    { title: "Comments", key: "comments", children: <ProfileCommentsTab /> },
    { title: "Replies", key: "replies", children: <ProfileRepliesTab /> },
  ];
  const { isMobile } = useDeviceInfo();

  return (
    <div className={clsx("relative items-center flex-row w-full")}>
      <Tabs
        destroyInactiveTabPanel={false}
        size="sm"
        disableAnimation={isMobile}
        variant={"underlined"}
        color={"primary"}
        radius={isMobile ? "full" : "sm"}
        className="justify-center"
        defaultSelectedKey={category}
        selectedKey={category}
        onSelectionChange={(key) => {
          if (!category) history.replaceState({}, "", `/@${username}/${key}`);
          else history.pushState({}, "", `/@${username}/${key}`);
        }}
        classNames={{
          tabList: "max-sm:gap-0 max-sm:bg-transparent max-sm:p-0",
        }}
      >
        {profileTabs.map((tab) => (
          <Tab key={tab.key} title={tab.title}>
            {tab.children}
          </Tab>
        ))}
      </Tabs>
    </div>
  );
}
