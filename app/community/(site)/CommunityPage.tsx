"use client";

import CommuntiyLog from "@/components/community/CommuntiyLog";
import STabs from "@/components/ui/STabs";
import { addCommunityHandler } from "@/hooks/redux/reducers/CommunityReducer";
import { useAppDispatch, useAppSelector } from "@/hooks/redux/store";
import { useDeviceInfo } from "@/hooks/redux/useDeviceInfo";
import { getMetadata, updateMetadata } from "@/utils/metadata";
import { TrendingUp, Sparkles, ClockPlus, Logs } from "lucide-react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { Key, useEffect, useMemo, useState } from "react";
import { FeedList } from "@/components/FeedList";
import { useTranslations } from "next-intl";

const ICON_SIZE = 20;

import { sdsApi } from "@/libs/sds";

function CommunityPage({
  community: initCommunity,
  account: initAccount,
}: {
  community?: Community;
  account?: AccountExt;
  pinnedPost?: PromotedPost[];
}) {
  const th = useTranslations("Home.tabs");
  const tc = useTranslations("Community");
  const { category, tag } = useParams() as { category: string; tag: string };
  const [community, setCommunity] = useState<Community | undefined>(
    initCommunity,
  );
  const [account, setAccount] = useState<AccountExt | undefined>(initAccount);

  const { data: session } = useSession();

  useEffect(() => {
    if (!initCommunity && tag) {
      const commAccount = `hive-${tag}`;
      Promise.all([
        sdsApi.getAccountExt(commAccount, session?.user?.name),
        sdsApi.getCommunity(commAccount, session?.user?.name),
      ]).then(([acc, comm]) => {
        setAccount(acc);
        setCommunity(comm);
      });
    }
  }, [tag, initCommunity, session]);

  const initialTab = category ?? "trending";
  const [selectedKey, setSelectedKey] = useState(initialTab);
  const { useSmaller } = useDeviceInfo();
  const isMobile = useSmaller("sm");
  const dispatch = useAppDispatch();

  const communityData =
    useAppSelector(
      (state) => state.communityReducer.values[community?.account || ""],
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

  const apiParams = `/${communityData?.account || ""}`;

  const communityTabs = useMemo(
    () => [
      {
        id: "trending",
        title: th("trending"),
        api: "getActiveCommunityPostsByTrending" + apiParams,
        icon: <TrendingUp size={ICON_SIZE} />,
      },

      {
        id: "popular",
        title: th("popular"),
        api: "getActiveCommunityPostsByInteraction" + apiParams,
        icon: <Sparkles size={ICON_SIZE} />,
      },
      {
        id: "created",
        title: th("recent"),
        api: "getCommunityPostsByCreated" + apiParams,
        icon: <ClockPlus size={ICON_SIZE} />,
      },

      {
        id: "log",
        title: tc("activities"),
        icon: <Logs size={ICON_SIZE} />,
        children: communityData?.account ? (
          <CommuntiyLog account={communityData.account} />
        ) : null,
      },
    ],
    [apiParams, isMobile, communityData?.account, th, tc],
  );

  if (!communityData || !account) return null;

  return (
    <div className="flex flex-col gap-2">
      <STabs
        key={`tabs-community-${session?.user?.name || "anonymous"}`}
        variant="bordered"
        selectedKey={selectedKey}
        onSelectionChange={handleSelectionChange}
        items={communityTabs}
        className={"md:mt-3"}
        tabHref={(tab) => `/${tab.id}/${communityData.account}`}
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
            <FeedList
              apiPath={tab.api || ""}
              observer={session?.user?.name || ""}
            />
          )
        }
      </STabs>
    </div>
  );
}

export default CommunityPage;
