"use client";

import MainWrapper from "@/components/wrappers/MainWrapper";
import CommunityCarousel from "@/components/carousal/CommunityCarousal";
import CommunityHeader from "@/components/CommunityHeader";
import CommunityInfoCard from "@/components/CommunityInfoCard";
import { useDisclosure } from "@heroui/modal";
import CommunityChatModal from "@/components/chat/community/CommunityChatModal";
import { toast } from "sonner";
import { useAppSelector } from "@/constants/AppFunctions";
import CommunityMembers from "@/components/community/CommunityMembers";
import CommunityTabPage from "./CommunityTabPage";
import { FaFire } from "react-icons/fa";
import { useDeviceInfo } from "@/hooks/useDeviceInfo";
import { MdInfo, MdNewLabel, MdPin } from "react-icons/md";
import { Tab, Tabs } from "@heroui/tabs";
import FeedPatternSwitch from "@/components/FeedPatternSwitch";
import { useParams, usePathname } from "next/navigation";
import SModal from "@/components/ui/SModal";
import { useEffect } from "react";
import SLink from "@/components/ui/SLink";

export default function CommunityPage({
  account,
  community,
}: {
  account: AccountExt;
  community: Community;
}) {
  let { category, tag } = useParams() as { category: string; tag: string };
  category = category?.toLowerCase();
  tag = tag?.toLowerCase();

  const chatDisclosure = useDisclosure();
  const leadershipDisclosure = useDisclosure();
  const pathname = usePathname();

  const { isMobile, isBetween920AndMobile } = useDeviceInfo();
  const communityInfo: Community =
    useAppSelector((state) => state.communityReducer.values)[
      community.account
    ] ?? community;

  useEffect(() => {
    if (category === "roles") {
      leadershipDisclosure.onOpenChange();
    }
  }, [category]);

  const communityTabs = [
    {
      title: "Trending",
      key: "trending",
      children: <CommunityTabPage />,
      icon: <FaFire size={22} />,
      priority: 1,
    },
    {
      title: "New",
      key: "created",
      children: <CommunityTabPage />,
      icon: <MdNewLabel size={22} />,
      priority: 2,
    },
  ];
  if (isMobile) {
    communityTabs.push({
      title: "Pinned",
      key: "pinned",
      children: <CommunityTabPage />,
      icon: <MdPin size={22} />,
      priority: 3,
    });
  }

  if (isBetween920AndMobile) {
    communityTabs.push({
      title: "About",
      key: "about",
      children: (
        <CommunityInfoCard
          onChatPress={() => {}}
          community={communityInfo}
          onLeadershipPress={leadershipDisclosure.onOpen}
        />
      ),
      icon: <MdInfo size={22} />,
      priority: 5,
    });
  }
  const sortedCommunityTabs = communityTabs.sort(
    (a, b) => a.priority - b.priority
  );

  function handleChatPress() {
    if (communityInfo && communityInfo.observer_subscribed) {
      chatDisclosure.onOpen();
    } else toast.info("Join to chat with the community!");
  }
  return (
    <div>
      <MainWrapper
        endClassName="overflow-y-scroll max-h-screen min-w-[320px] w-[320px] pb-10"
        endContent={
          <CommunityInfoCard
            onLeadershipPress={leadershipDisclosure.onOpen}
            onChatPress={handleChatPress}
            key={Math.random()}
            community={communityInfo}
          />
        }
      >
        <CommunityHeader
          onChatPress={handleChatPress}
          community={communityInfo}
          account={account}
          onLeadershipPress={leadershipDisclosure.onOpen}
        />
        <CommunityCarousel
          communityName={"hive-" + tag}
          className="mt-2 max-1md:mt-8"
        />

        <div className=" mt-4">
          <div className="relative items-center flex-row w-full">
            <Tabs
              destroyInactiveTabPanel={false}
              size={"sm"}
              disableAnimation={isMobile}
              color={"secondary"}
              radius={isMobile ? "full" : "sm"}
              className="justify-center"
              selectedKey={pathname}
              classNames={{
                tabList: "max-sm:gap-0 main-tab-list",
                panel: "w-full",
                tabContent: " w-full",
              }}
            >
              {sortedCommunityTabs.map((tab) => (
                <Tab
                  as={SLink}
                  href={`/${tab.key}/${"hive-" + tag}`}
                  key={`/${tab.key}/${"hive-" + tag}`}
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
            {!["about", "roles"].includes(category) && (
              <div className="absolute  top-0 right-0 max-sm:hidden">
                <FeedPatternSwitch />
              </div>
            )}
          </div>
        </div>
      </MainWrapper>
      {chatDisclosure.isOpen && (
        <CommunityChatModal
          isOpen={chatDisclosure.isOpen}
          onOpenChange={chatDisclosure.onOpenChange}
          community={communityInfo}
        />
      )}
      <SModal
        modalProps={{ scrollBehavior: "inside" }}
        isOpen={leadershipDisclosure.isOpen}
        onOpenChange={leadershipDisclosure.onOpenChange}
        title={() => "Members"}
        onClose={() => {
          if (category === "roles")
            history.replaceState({}, "", `/${"trending"}/${"hive-" + tag}`);
        }}
        body={() => (
          <CommunityMembers
            communityName={"hive-" + tag}
            community={communityInfo}
          />
        )}
      />
    </div>
  );
}
