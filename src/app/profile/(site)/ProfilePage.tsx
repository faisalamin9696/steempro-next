"use client";

import { Tab, Tabs } from "@heroui/tabs";
import React, { useEffect } from "react";
import usePathnameClient from "@/libs/utils/usePathnameClient";
import ProfileBlogsTab from "../(tabs)/blog/page";
import ProfileWalletTab from "../(tabs)/wallet/ProfileWalletTab";
import FeedPatternSwitch from "@/components/FeedPatternSwitch";
import { useAppDispatch, useAppSelector } from "@/libs/constants/AppFunctions";
import ProfilePostsMainTab from "../(tabs)/postsMain/page";
import ProfileSettingsTab from "../(tabs)/settings/page";
import { saveLoginHandler } from "@/libs/redux/reducers/LoginReducer";
import { addProfileHandler } from "@/libs/redux/reducers/ProfileReducer";
import ProfileCommunitiesMainTab from "../(tabs)/CommunitiesMain/page";
import { useDeviceInfo } from "@/libs/utils/useDeviceInfo";
import ProfileNotificationsTab from "../(tabs)/notifications/page";
import {
  MdFeed,
  MdGroups,
  MdNotifications,
  MdRssFeed,
  MdSettings,
  MdWallet,
} from "react-icons/md";
import { useSession } from "next-auth/react";
import { twMerge } from "tailwind-merge";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function ProfilePage({ data }: { data: AccountExt }) {
  let { username, category } = usePathnameClient();
  const { data: session } = useSession();
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const profileInfo =
    useAppSelector((state) => state.profileReducer.value)[data?.name] ?? data;
  const isSelf = session?.user?.name === username;
  const dispatch = useAppDispatch();
  const { isMobile } = useDeviceInfo();
  const pathname = usePathname();

  useEffect(() => {
    if (data)
      if (isSelf)
        dispatch(
          saveLoginHandler({ ...data, unread_count: loginInfo.unread_count })
        );
      else dispatch(addProfileHandler(data));
  }, [data]);

  const profileTabs = [
    {
      title: "Blog",
      key: "blog",
      children: <ProfileBlogsTab />,
      icon: <MdRssFeed size={22} />,
      priority: 0,
    },
    {
      title: "Posts",
      key: "posts",
      children: <ProfilePostsMainTab />,
      icon: <MdFeed size={22} />,
      priority: 1,
    },

    {
      title: "Communities",
      key: "communities",
      children: <ProfileCommunitiesMainTab />,
      icon: <MdGroups size={22} />,

      priority: 3,
    },
    {
      title: "Wallet",
      key: "wallet",
      children: <ProfileWalletTab data={isSelf ? loginInfo : profileInfo} />,
      icon: <MdWallet size={22} />,

      priority: 4,
    },
  ];

  if (isSelf)
    profileTabs.push({
      title: "Settings",
      key: "settings",
      children: <ProfileSettingsTab />,
      icon: <MdSettings size={22} />,
      priority: 5,
    });
  else
    profileTabs.push({
      title: "Notifications",
      key: "notifications",
      icon: <MdNotifications size={22} />,
      children: <ProfileNotificationsTab />,
      priority: 2,
    });

  const sortedProfileTabs = profileTabs.sort((a, b) => a.priority - b.priority);

  return (
    <div className={twMerge("relative items-center flex-row w-full")}>
      <Tabs
        size={"sm"}
        disableAnimation={isMobile}
        color={"secondary"}
        radius={isMobile ? "full" : "sm"}
        className="justify-center"
        selectedKey={
          category
            ? ["comments", "replies", "friends"].includes(category)
              ? `/@${username}/${"posts"}`
              : pathname
            : `/@${username}/${"blog"}`
        }
        classNames={{
          tabList: "max-sm:gap-0 main-tab-list",
          panel: "w-full",
          tabContent: " w-full",
        }}
      >
        {sortedProfileTabs.map((tab) => (
          <Tab
            as={Link}
            href={`/@${username}/${tab.key}`}
            key={`/@${username}/${tab.key}`}
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

      {!["notifications", "wallet", "settings"].includes(category) && (
        <div className="absolute  top-0 right-0 max-sm:hidden">
          <FeedPatternSwitch />
        </div>
      )}
    </div>
  );
}
