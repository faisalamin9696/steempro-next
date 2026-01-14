"use client";

import CommunityCard from "@/components/community/CommunityCard";
import CommuntiyLog from "@/components/community/CommuntiyLog";
import STabs from "@/components/ui/STabs";
import { addCommunityHandler } from "@/hooks/redux/reducers/CommunityReducer";
import { useAppDispatch, useAppSelector } from "@/hooks/redux/store";
import { useDeviceInfo } from "@/hooks/redux/useDeviceInfo";
import { getMetadata, updateMetadata } from "@/utils/metadata";
import { Accordion, AccordionItem } from "@heroui/react";
import { TrendingUp, Sparkles, ClockPlus, Logs } from "lucide-react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { Key, useEffect, useMemo, useState } from "react";

import { FeedList } from "@/components/FeedList";
import HomeCarousal from "@/components/HomeCarousal";

const ICON_SIZE = 20;

function CommunityPage({
  community,
  account,
  pinnedPost,
}: {
  community: Community;
  account: AccountExt;
  pinnedPost: PromotedPost[];
}) {
  const { category, tag } = useParams() as { category: string; tag: string };
  const initialTab = category ?? "trending";
  const [selectedKey, setSelectedKey] = useState(initialTab);
  const { data: session } = useSession();
  const { useSmaller } = useDeviceInfo();
  const isMobile = useSmaller("sm");
  const dispatch = useAppDispatch();

  const communityData =
    useAppSelector(
      (state) => state.communityReducer.values[community.account]
    ) ?? community;

  useEffect(() => {
    if (community) addCommunityHandler(community);
  }, [community, dispatch]);

  const handleSelectionChange = (key: Key) => {
    if (!key) return;
    setSelectedKey(key.toString());
    const { title, description } = getMetadata.home(key.toString());
    updateMetadata({ title, description });
  };

  const apiParams = `/${community.account}`;

  const communityTabs = useMemo(
    () => [
      {
        id: "trending",
        title: "Trending",
        api: "getActiveCommunityPostsByTrending" + apiParams,
        icon: <TrendingUp size={ICON_SIZE} />,
      },

      {
        id: "popular",
        title: "Popular",
        api: "getActiveCommunityPostsByInteraction" + apiParams,
        icon: <Sparkles size={ICON_SIZE} />,
      },
      {
        id: "created",
        title: "Recent",
        api: "getCommunityPostsByCreated" + apiParams,
        icon: <ClockPlus size={ICON_SIZE} />,
      },

      {
        id: "log",
        title: "Activities",
        icon: <Logs size={ICON_SIZE} />,
        children: <CommuntiyLog account={community.account} />,
      },
    ],
    [apiParams, isMobile]
  );

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
          <CommunityCard
            community={communityData}
            account={account}
            classNames={{
              base: "shadow-none! border-none! bg-transparent",
              body: "pt-0!",
            }}
          />
        </AccordionItem>
      </Accordion>
      {pinnedPost?.length > 0 && (
        <div className="mt-3">
          <HomeCarousal data={pinnedPost} showPagination size="sm" />
        </div>
      )}
      <STabs
        variant="bordered"
        selectedKey={selectedKey}
        onSelectionChange={handleSelectionChange}
        items={communityTabs}
        className={pinnedPost.length > 0 ? "" : "md:mt-3"}
        tabHref={(tab) => `/${tab.id}/${community.account}`}
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
          tab.children ? (
            tab.children
          ) : (
            <FeedList apiPath={tab.api} observer={session?.user?.name} />
          )
        }
      </STabs>
    </div>
  );
}

export default CommunityPage;
