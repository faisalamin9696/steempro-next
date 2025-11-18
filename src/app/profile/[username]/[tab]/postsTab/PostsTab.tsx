"use client";

import React from "react";
import { Tab, Tabs } from "@heroui/tabs";
import { twMerge } from "tailwind-merge";
import ProfileTabPage from "../ProfileTabPage";
import { useDeviceInfo } from "@/hooks/useDeviceInfo";
import { getMetadata, updateMetadata } from "@/utils/metadata";
import { useRouter } from "next/navigation";

interface Props {
  account: AccountExt;
  tab: string;
}

export default function PostsTab(props: Props) {
  let { account, tab } = props;
  const router = useRouter();
  const { isMobile } = useDeviceInfo();

  const profileTabs = [
    {
      title: "Posts",
      key: "posts",
      children: <ProfileTabPage username={account.name} tab="posts" />,
    },
    {
      title: "Friends",
      key: "friends",
      children: <ProfileTabPage username={account.name} tab="friends" />,
    },
    {
      title: "Comments",
      key: "comments",
      children: <ProfileTabPage username={account.name} tab="comments" />,
    },
    {
      title: "Replies",
      key: "replies",
      children: <ProfileTabPage username={account.name} tab="replies" />,
    },
  ];

  return (
    <div className={twMerge("relative items-center flex-row w-full")}>
      <Tabs
        destroyInactiveTabPanel={false}
        size="sm"
        variant={"underlined"}
        color={"secondary"}
        radius={isMobile ? "full" : "sm"}
        className="justify-center"
        items={profileTabs}
        defaultSelectedKey={tab}
        onSelectionChange={(key) => {
          if (["comments", "replies", "friends"].includes(key.toString())) {
            router.push(`/@${account.name}/${key.toString()}`);
          }
          const { title, description } = getMetadata.profileSync(
            account.name,
            key?.toString(),
            account
          );
          updateMetadata({ title, description });
        }}
      >
        {(item) => (
          <Tab key={item.key} title={item.title}>
            {item.children}
          </Tab>
        )}
      </Tabs>
    </div>
  );
}
