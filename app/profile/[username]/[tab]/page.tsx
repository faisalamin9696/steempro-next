"use client";

import { getMetadata, updateMetadata } from "@/utils/metadata";
import { useSession } from "next-auth/react";
import { Key, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useDeviceInfo } from "@/hooks/redux/useDeviceInfo";
import { useAppDispatch, useAppSelector } from "@/hooks/redux/store";
import { Accordion, AccordionItem } from "@heroui/accordion";
import ProfileCard from "@/components/profile/ProfileCard";
import STabs from "@/components/ui/STabs";
import { Wallet, Users, Bell, Rss, Newspaper } from "lucide-react";
import WalletTab from "./wallet/WalletTab";
import NotificationsCard from "@/components/profile/NotificationsCard";
import CommunitiesTab from "./communities/page";
import useFeedLayout from "@/hooks/useFeedLayout";
import { addLoginHandler } from "@/hooks/redux/reducers/LoginReducer";
import { addProfileHandler } from "@/hooks/redux/reducers/ProfileReducer";
import { FeedList } from "@/components/FeedList";

const ICON_SIZE = 20;

function ProfilePage({ account }: { account: AccountExt }) {
  const { username, tab } = useParams() as { username: string; tab: string };
  const initialTab = tab ?? "blog";
  const loginData = useAppSelector((s) => s.loginReducer.value);
  const otherProfileData = useAppSelector(
    (s) => s.profileReducer.values[account.name]
  );
  const [selectedKey, setSelectedKey] = useState(initialTab);
  const { data: session } = useSession();
  const { useSmaller } = useDeviceInfo();
  const isMobile = useSmaller("sm");
  const isSelf = session?.user?.name === account.name;
  const profileData = isSelf ? loginData : otherProfileData ?? account;
  const { layout, className } = useFeedLayout();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (isSelf) {
      dispatch(addLoginHandler(account));
    } else {
      dispatch(addProfileHandler(account));
    }
  }, [account, isSelf]);

  const handleSelectionChange = (key: Key) => {
    if (!key) return;
    setSelectedKey(key.toString());
    const { title, description } = getMetadata.home(key.toString());
    updateMetadata({ title, description });
  };

  const apiParams = `/${username}`;

  const profilePostsTab = useMemo(
    () => [
      { id: "posts", title: "Posts", api: "getPostsByAuthor" + apiParams },
      {
        id: "comments",
        title: "Comments",
        api: "getCommentsByAuthor" + apiParams,
      },
      {
        id: "replies",
        title: "Replies",
        api: "getCommentsByParentAuthor" + apiParams,
      },
    ],
    [apiParams]
  );

  const profileTabs = useMemo(
    () => [
      {
        id: "blog",
        title: "Blog",
        api: "getAccountBlog" + apiParams,
        icon: <Rss size={ICON_SIZE} />,
      },
      {
        id: "posts",
        title: "Posts",
        api: "getPostsByAuthor" + apiParams,
        icon: <Newspaper size={ICON_SIZE} />,
        children: (
          <STabs
            classNames={{ tabList: "pt-0" }}
            selectedKey={selectedKey}
            onSelectionChange={handleSelectionChange}
            items={profilePostsTab}
            tabHref={(tab) => `/@${username}/${tab.id}`}
            tabTitle={(tab) => tab.title}
            variant="underlined"
            color="primary"
          >
            {(tab) => (
              <FeedList apiPath={tab.api} observer={session?.user?.name} />
            )}
          </STabs>
        ),
      },
      {
        id: "notifications",
        title: "Notifications",
        icon: <Bell size={ICON_SIZE} />,
        children: <NotificationsCard username={username} />,
      },
      {
        id: "communities",
        title: "Communities",
        icon: <Users size={ICON_SIZE} />,
        children: <CommunitiesTab account={profileData} />,
      },
      {
        id: "wallet",
        title: "Wallet",
        icon: <Wallet size={ICON_SIZE} />,
        children: <WalletTab account={profileData} />,
      },
    ],
    [apiParams, isMobile, profileData]
  );

  const normalizedTab = ["posts", "comments", "replies"].includes(tab)
    ? "posts"
    : tab ?? "blog";

  return (
    <div className="flex flex-col gap-2">
      <Accordion
        isCompact
        variant="bordered"
        className="border-1 block lg:hidden"
        itemClasses={{
          title: "text-muted",
          indicator: "text-foreground text-muted",
        }}
      >
        <AccordionItem key="profile" aria-label="Profile details" title="About">
          <ProfileCard
            account={profileData}
            classNames={{
              base: "shadow-none! border-none! bg-transparent",
              body: "pt-0!",
            }}
          />
        </AccordionItem>
      </Accordion>
      <STabs
        variant="bordered"
        selectedKey={normalizedTab}
        onSelectionChange={handleSelectionChange}
        items={profileTabs}
        className="md:mt-3"
        tabHref={(tab) => `/@${username}/${tab.id}`}
        tabTitle={(tab) => (
          <div className="flex items-center space-x-2">
            {tab.icon}
            {!isMobile || selectedKey === tab.id ? (
              <span>{tab.title}</span>
            ) : null}
          </div>
        )}
      >
        {(tab) =>
          tab?.children ? (
            tab.children
          ) : (
            <FeedList apiPath={tab.api} observer={session?.user?.name} />
          )
        }
      </STabs>
    </div>
  );
}

export default ProfilePage;
