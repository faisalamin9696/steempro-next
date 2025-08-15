"use client";

import React from "react";
import { Tab, Tabs } from "@heroui/tabs";
import { useDeviceInfo } from "@/hooks/useDeviceInfo";
import { twMerge } from "tailwind-merge";
import { usePathname } from "next/navigation";
import ProfileTabPage from "../ProfileTabPage";
import SLink from "@/components/ui/SLink";
import { useLanguage } from "@/contexts/LanguageContext";

interface Props {
  username: string;
  tab: string;
}

export default function PostsTab(props: Props) {
  let { username, tab } = props;
  const pathname = usePathname();
  const { t } = useLanguage();

  const profileTabs = [
    {
      title: t("profile.posts"),
      key: "posts",
      children: <ProfileTabPage />,
    },
    {
      title: t("profile.friends"),
      key: "friends",
      children: <ProfileTabPage />,
    },
    {
      title: t("comment.comments"),
      key: "comments",
      children: <ProfileTabPage />,
    },
    {
      title: t("reply.replies"),
      key: "replies",
      children: <ProfileTabPage />,
    },
  ];
  const { isMobile } = useDeviceInfo();

  return (
    <div className={twMerge("relative items-center flex-row w-full")}>
      <Tabs
        destroyInactiveTabPanel={false}
        size="sm"
        disableAnimation={isMobile}
        variant={"underlined"}
        color={"secondary"}
        radius={isMobile ? "full" : "sm"}
        className="justify-center"
        defaultSelectedKey={`/@${username}/${tab}`}
        selectedKey={tab ? pathname : `/@${username}/${"posts"}`}
        classNames={{
          tabList: "max-sm:gap-0 max-sm:bg-transparent max-sm:p-0",
        }}
      >
        {profileTabs.map((tab) => (
          <Tab
            as={SLink}
            key={`/@${username}/${tab.key}`}
            title={tab.title}
            href={`/@${username}/${tab.key}`}
          >
            {tab.children}
          </Tab>
        ))}
      </Tabs>
    </div>
  );
}
