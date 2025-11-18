"use client";

import { Tab, Tabs } from "@heroui/tabs";
import React, { useEffect } from "react";
import FeedPatternSwitch from "@/components/FeedPatternSwitch";
import { useAppDispatch, useAppSelector } from "@/constants/AppFunctions";
import { saveLoginHandler } from "@/hooks/redux/reducers/LoginReducer";
import { addProfileHandler } from "@/hooks/redux/reducers/ProfileReducer";
import { useDeviceInfo } from "@/hooks/useDeviceInfo";
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
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import ProfileTabPage from "./ProfileTabPage";
import { useDisclosure } from "@heroui/modal";
import { useLogin } from "@/components/auth/AuthProvider";
import AccountHeader from "@/components/AccountHeader";
import PostsTab from "./postsTab/PostsTab";
import CommunitiesTab from "./communitiesTab/CommunitiesTab";
import WalletTab from "./walletTab/WalletTab";
import SettingsPage from "@/app/settings/SettingsPage";
import NotificationsTable from "@/components/NotificationsTable";
import UserChatModal from "@/components/chat/user/UserChatModal";
import ChatNotificationsTable from "@/components/chat/user/ChatNotificationTable";
import { Badge } from "@heroui/badge";
import { BsChatDots } from "react-icons/bs";
import { FaRegBell } from "react-icons/fa";
import { getMetadata, updateMetadata } from "@/utils/metadata";

let iconSize = 20;

export default function ProfilePage({ data }: { data: AccountExt }) {
  let { username, tab } = useParams() as { username: string; tab: string };
  username = username?.toLowerCase();
  tab = tab?.toLowerCase();
  const profileInfo =
    useAppSelector((state) => state.profileReducer.value)[data?.name] ?? data;

  const loginInfo = useAppSelector((state) => state.loginReducer.value);

  const dispatch = useAppDispatch();
  const { isMobile } = useDeviceInfo();
  const { data: session } = useSession();
  const isSelf = session?.user?.name === username;
  const chatDisclosure = useDisclosure();
  const searchParams = useSearchParams();
  const chatParam = searchParams.has("chat");
  const router = useRouter();
  const pathname = usePathname();
  const { authenticateUser, isAuthorized } = useLogin();

  useEffect(() => {
    if (data)
      if (isSelf)
        dispatch(
          saveLoginHandler({
            ...data,
          })
        );
      else dispatch(addProfileHandler(data));
  }, [data]);

  useEffect(() => {
    if (chatParam && !chatDisclosure.isOpen) {
      openChat();
      router.replace(pathname);
    }
  }, [chatParam]);

  function openChat() {
    authenticateUser(false, true);
    if (!isAuthorized(true)) {
      return;
    }
    chatDisclosure.onOpen();
  }

  return (
    <div>
      <AccountHeader
        account={profileInfo}
        onChatPress={chatDisclosure.onOpen}
      />
      <div className={twMerge("relative items-center flex-row w-full")}>
        <Tabs
          size={"sm"}
          color={"secondary"}
          radius={isMobile ? "full" : "sm"}
          className="justify-center"
          destroyInactiveTabPanel={false}
          items={getProfileTabs(username, tab, data)}
          defaultSelectedKey={
            ["comments", "replies", "friends"].includes(tab) ? "posts" : tab
          }
          onSelectionChange={(key) => {
            router.push(`/@${username}/${key.toString()}`);
            const { title, description } = getMetadata.profileSync(
              username,
              key?.toString(),
              isSelf ? loginInfo : profileInfo
            );
            updateMetadata({ title, description });
          }}
        >
          {(item) => (
            <Tab
              key={item.key}
              title={
                <div className="flex items-center gap-1">
                  {item?.icon}
                  {isMobile ? (
                    item.key === tab && <span>{item.title}</span>
                  ) : (
                    <span>{item.title}</span>
                  )}
                </div>
              }
            >
              {item.children}
            </Tab>
          )}
        </Tabs>

        {!["notifications", "wallet", "settings"].includes(tab) && (
          <div className="absolute  top-0 right-0 max-sm:hidden">
            <FeedPatternSwitch />
          </div>
        )}
      </div>
      {chatDisclosure.isOpen && (
        <UserChatModal
          isOpen={chatDisclosure.isOpen}
          onOpenChange={chatDisclosure.onOpenChange}
          account={profileInfo}
        />
      )}
    </div>
  );
}

const getProfileTabs = (username: string, tab: string, account: AccountExt) => {
  const { data: session } = useSession();
  const isSelf = session?.user?.name === username;
  const commonData = useAppSelector((state) => state.commonReducer.values);

  const profileTabs = [
    {
      title: "Blog",
      key: "blog",
      children: <ProfileTabPage tab="blog" username={username} />,
      icon: <MdRssFeed size={iconSize} />,
      priority: 0,
    },
    {
      title: "Posts",
      key: "posts",
      children: <PostsTab tab={tab} account={account} />,
      icon: <MdFeed size={iconSize} />,
      priority: 1,
    },

    {
      title: "Communities",
      key: "communities",
      children: <CommunitiesTab username={username} tab={tab} />,
      icon: <MdGroups size={iconSize} />,

      priority: 3,
    },
    {
      title: "Wallet",
      key: "wallet",
      children: <WalletTab data={account} />,
      icon: <MdWallet size={iconSize} />,

      priority: 4,
    },
  ];

  if (isSelf)
    profileTabs.push({
      title: "Settings",
      key: "settings",
      children: <SettingsPage />,
      icon: <MdSettings size={iconSize} />,
      priority: 5,
    });

  profileTabs.push({
    title: "Notifications",
    key: "notifications",
    icon: <MdNotifications size={iconSize} />,
    children: isSelf ? (
      <Tabs
        size={"sm"}
        color={"secondary"}
        className="justify-center"
        destroyInactiveTabPanel={false}
        variant={"underlined"}
      >
        <Tab
          key="general"
          title={
            <div className="flex flex-row gap-1 items-center">
              <p>General</p>
              <Badge
                color="secondary"
                variant="solid"
                shape="circle"
                showOutline={false}
                size="sm"
                isInvisible={commonData.unread_count < 1}
                content={
                  commonData.unread_count > 99 ? "99+" : commonData.unread_count
                }
              >
                <FaRegBell className="m-1" size={18} />
              </Badge>
            </div>
          }
        >
          <NotificationsTable username={username} isOpen={true} />
        </Tab>
        <Tab
          key="chat"
          title={
            <div className="flex flex-row gap-2 items-center">
              <p>Chat</p>
              <Badge
                color="secondary"
                variant="solid"
                size="sm"
                showOutline={false}
                isInvisible={!commonData.unread_count_chat}
                content={
                  commonData.unread_count_chat > 99
                    ? "99+"
                    : commonData.unread_count_chat
                }
              >
                <BsChatDots className="m-1" size={18} />
              </Badge>
            </div>
          }
        >
          <div className="flex flex-col gap-4 p-1">
            <ChatNotificationsTable onOpenChange={() => {}} isOpen={true} />
          </div>
        </Tab>
      </Tabs>
    ) : (
      <NotificationsTable username={username} isOpen={true} />
    ),

    priority: 2,
  });

  const sortedProfileTabs = profileTabs.sort((a, b) => a.priority - b.priority);

  return sortedProfileTabs;
};
