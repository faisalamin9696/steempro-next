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
import { useDeviceInfo } from "@/hooks/useDeviceInfo";
import { MdInfo, MdNewLabel } from "react-icons/md";
import { Tab, Tabs } from "@heroui/tabs";
import FeedPatternSwitch from "@/components/FeedPatternSwitch";
import { useParams, useRouter } from "next/navigation";
import SModal from "@/components/ui/SModal";
import { useEffect } from "react";
import { PiPushPinFill } from "react-icons/pi";
import { FiTrendingUp } from "react-icons/fi";
import { getMetadata, updateMetadata } from "@/utils/metadata";

let iconSize = 20;

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
  const router = useRouter();

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
      children: <CommunityTabPage category="trending" />,
      icon: <FiTrendingUp size={iconSize} />,
      priority: 1,
    },
    {
      title: "New",
      key: "created",
      children: <CommunityTabPage category="created" />,
      icon: <MdNewLabel size={iconSize} />,
      priority: 2,
    },
  ];
  if (isMobile) {
    communityTabs.push({
      title: "Pinned",
      key: "pinned",
      children: <CommunityTabPage category="pinned" />,
      icon: <PiPushPinFill size={iconSize} />,
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
      icon: <MdInfo size={iconSize} />,
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
              color={"secondary"}
              radius={isMobile ? "full" : "sm"}
              className="justify-center"
              items={sortedCommunityTabs}
              defaultSelectedKey={category}
              onSelectionChange={(key) => {
                router.push(`/${key.toString()}/${"hive-" + tag}`);
                const { title, description, keywords } =
                  getMetadata.communitySync(key?.toString(), community);
                updateMetadata({ title, description, keywords });
              }}
            >
              {(item) => (
                <Tab
                  key={item.key}
                  title={
                    <div className="flex items-center space-x-2">
                      {item?.icon}
                      <span>{item.title}</span>
                    </div>
                  }
                >
                  {item.children}
                </Tab>
              )}
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
