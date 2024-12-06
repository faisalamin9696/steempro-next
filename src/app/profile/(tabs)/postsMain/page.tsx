"use client";

import usePathnameClient from "@/libs/utils/usePathnameClient";
import React from "react";
import ProfileCommentsTab from "../comments/page";
import ProfileRepliesTab from "../replies/page";
import { Tab, Tabs } from "@nextui-org/tabs";
import { clsx } from "clsx";
import ProfilePostsTab from "../posts/page";
import ProfileFriendsTab from "../friends/page";

export default function ProfilePostsMainTab() {
  let { username, category } = usePathnameClient();

  const profileTabs = [
    { title: "Posts", key: "posts", children: <ProfilePostsTab /> },
    { title: "Friends", key: "friends", children: <ProfileFriendsTab /> },
    { title: "Comments", key: "comments", children: <ProfileCommentsTab /> },
    { title: "Replies", key: "replies", children: <ProfileRepliesTab /> },
  ];

  return (
    <div className={clsx("relative items-center flex-row w-full")}>
      <Tabs
        destroyInactiveTabPanel={false}
        size="sm"
        variant="underlined"
        disableAnimation
        disableCursorAnimation
        color={"secondary"}
        radius="full"
        className="justify-center"
        defaultSelectedKey={category}
        selectedKey={category}
        onSelectionChange={(key) => {
          if (!category) history.replaceState({}, "", `/@${username}/${key}`);
          else history.pushState({}, "", `/@${username}/${key}`);
        }}
        classNames={{
          tabList: "max-sm:gap-0 bg-transparent p-0",
          tab: "max-sm:max-w-prose max-sm:px-2 max-sm:h-5",
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
