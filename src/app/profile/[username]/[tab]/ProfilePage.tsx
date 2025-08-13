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
import ChatModal from "@/components/chat/user/ChatModal";
import { useDisclosure } from "@heroui/modal";
import { useLogin } from "@/components/auth/AuthProvider";
import AccountHeader from "@/components/AccountHeader";
import PostsTab from "./postsTab/PostsTab";
import CommunitiesTab from "./communitiesTab/CommunitiesTab";
import WalletTab from "./walletTab/WalletTab";
import SettingsPage from "@/app/settings/SettingsPage";
import SLink from "@/components/ui/SLink";
import NotificationsTable from "@/components/NotificationsTable";

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
      <AccountHeader account={profileInfo} onChatPress={openChat} />
      <div className={twMerge("relative items-center flex-row w-full")}>
        <Tabs
          size={"sm"}
          disableAnimation={isMobile}
          color={"secondary"}
          radius={isMobile ? "full" : "sm"}
          className="justify-center"
          selectedKey={
            tab
              ? ["comments", "replies", "friends"].includes(tab)
                ? `/@${username}/${"posts"}`
                : `/@${username}/${tab}`
              : `/@${username}/${"blog"}`
          }
          classNames={{
            tabList: "max-sm:gap-0 main-tab-list",
            panel: "w-full",
            tabContent: " w-full",
          }}
        >
          {getProfileTabs(username, tab, isSelf ? loginInfo : profileInfo).map(
            (tab) => (
              <Tab
                as={SLink}
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
            )
          )}
        </Tabs>

        {!["notifications", "wallet", "settings"].includes(tab) && (
          <div className="absolute  top-0 right-0 max-sm:hidden">
            <FeedPatternSwitch />
          </div>
        )}
      </div>
      {chatDisclosure.isOpen && profileInfo && (
        <ChatModal
          isOpen={chatDisclosure.isOpen}
          onOpenChange={chatDisclosure.onOpenChange}
          account={profileInfo}
        />
      )}
    </div>
  );
}

const getProfileTabs = (
  username: string,
  tab: string,
  walletProfile: AccountExt
) => {
  const { data: session } = useSession();
  const isSelf = session?.user?.name === username;

  const profileTabs = [
    {
      title: "Blog",
      key: "blog",
      children: <ProfileTabPage />,
      icon: <MdRssFeed size={22} />,
      priority: 0,
    },
    {
      title: "Posts",
      key: "posts",
      children: <PostsTab username={username} tab={tab} />,
      icon: <MdFeed size={22} />,
      priority: 1,
    },

    {
      title: "Communities",
      key: "communities",
      children: <CommunitiesTab username={username} tab={tab} />,
      icon: <MdGroups size={22} />,

      priority: 3,
    },
    {
      title: "Wallet",
      key: "wallet",
      children: <WalletTab data={walletProfile} />,
      icon: <MdWallet size={22} />,

      priority: 4,
    },
  ];

  if (isSelf)
    profileTabs.push({
      title: "Settings",
      key: "settings",
      children: <SettingsPage />,
      icon: <MdSettings size={22} />,
      priority: 5,
    });
  else
    profileTabs.push({
      title: "Notifications",
      key: "notifications",
      icon: <MdNotifications size={22} />,
      children: <NotificationsTable username={username} isOpen={true} />,
      priority: 2,
    });

  const sortedProfileTabs = profileTabs.sort((a, b) => a.priority - b.priority);

  return sortedProfileTabs;
};
