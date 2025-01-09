"use client";

import { Tab, Tabs } from "@nextui-org/tabs";
import React, { useEffect } from "react";
import usePathnameClient from "@/libs/utils/usePathnameClient";
import ProfileBlogsTab from "../(tabs)/blog/page";
import ProfileWalletTab from "../(tabs)/wallet/ProfileWalletTab";
import FeedPatternSwitch from "@/components/FeedPatternSwitch";
import { useAppDispatch, useAppSelector } from "@/libs/constants/AppFunctions";
import clsx from "clsx";
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

export default function ProfilePage({ data }: { data: AccountExt }) {
  let { username, category } = usePathnameClient();

  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const profileInfo =
    useAppSelector((state) => state.profileReducer.value)[data?.name] ?? data;

  const isSelf = !!loginInfo.name && loginInfo.name === username;
  const dispatch = useAppDispatch();

  const { isMobile } = useDeviceInfo();

  // useEffect(() => {
  //     router.refresh();
  // }, [pathname]);

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
      icon: <MdRssFeed size={24} />,
      priority: 0,
    },
    {
      title: "Posts",
      key: "posts",
      children: <ProfilePostsMainTab />,
      icon: <MdFeed size={24} />,
      priority: 1,
    },

    {
      title: "Communities",
      key: "communities",
      children: <ProfileCommunitiesMainTab />,
      icon: <MdGroups size={24} />,

      priority: 3,
    },
    {
      title: "Wallet",
      key: "wallet",
      children: <ProfileWalletTab data={isSelf ? loginInfo : profileInfo} />,
      icon: <MdWallet size={24} />,

      priority: 4,
    },
  ];

  if (isSelf)
    profileTabs.push({
      title: "Settings",
      key: "settings",
      children: <ProfileSettingsTab />,
      icon: <MdSettings size={24} />,
      priority: 5,
    });
  else
    profileTabs.push({
      title: "Notifications",
      key: "notifications",
      icon: <MdNotifications size={24} />,
      children: <ProfileNotificationsTab />,
      priority: 2,
    });

  const sortedProfileTabs = profileTabs.sort((a, b) => a.priority - b.priority);

  return (
    <div className={clsx("relative items-center flex-row w-full")}>
      <Tabs
        isVertical={!isMobile}
        size={isMobile ? "sm" : "md"}
        color={"secondary"}
        radius={isMobile ? "full" : "sm"}
        selectedKey={
          ["comments", "replies", "friends"].includes(category)
            ? "posts"
            : category
        }
        className="justify-center"
        defaultSelectedKey={
          ["comments", "replies", "friends"].includes(category)
            ? "posts"
            : category
        }
        onSelectionChange={(key) => {
          if (!category) history.replaceState({}, "", `/@${username}/${key}`);
          else history.pushState({}, "", `/@${username}/${key}`);
        }}
        classNames={{
          tabList: "max-sm:gap-0 main-tab-list",
          tab: "max-sm:max-w-prose max-sm:px-2 max-sm:h-5",
          panel: "w-full",
          tabContent: " w-full",
        }}
      >
        {sortedProfileTabs.map((tab) => (
          <Tab
            hidden
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

      {!["notifications", "wallet", "settings"].includes(category) && (
        <div className="absolute  top-0 right-0 max-sm:hidden">
          <FeedPatternSwitch />
        </div>
      )}
    </div>
  );
}
