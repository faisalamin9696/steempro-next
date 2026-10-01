"use client";

import { getMetadata, updateMetadata } from "@/utils/metadata";
import { useSession } from "next-auth/react";
import { Key, useState } from "react";
import STabs from "@/components/ui/STabs";
import { Sparkles, Zap, TrendingUp, ClockPlus, DollarSign } from "lucide-react";
import { FeedList } from "@/components/FeedList";
import { useDeviceInfo } from "@/hooks/redux/useDeviceInfo";
import { useTranslations } from "next-intl";
import { HOME_FEED_APIS } from "@/utils/feedApis";

const ICON_SIZE = 20;

export function HomeTabs({
  category,
  initialApiPath,
  initialFeed,
}: {
  category: string;
  initialApiPath: string;
  initialFeed: Feed[];
}) {
  const t = useTranslations("Home.tabs");
  const { data: session } = useSession();
  const [selectedKey, setSelectedKey] = useState(category || "trending");
  const { isMobile } = useDeviceInfo();

  const homeTabs = [
    {
      id: "trending",
      title: t("trending"),
      api: HOME_FEED_APIS.trending,
      icon: <TrendingUp size={ICON_SIZE} />,
    },
    {
      id: "popular",
      title: t("popular"),
      api: HOME_FEED_APIS.popular,
      icon: <Sparkles size={ICON_SIZE} />,
    },
    {
      id: "created",
      title: t("recent"),
      api: HOME_FEED_APIS.created,
      icon: <ClockPlus size={ICON_SIZE} />,
    },
    {
      id: "hot",
      title: t("hot"),
      api: HOME_FEED_APIS.hot,
      icon: <Zap size={ICON_SIZE} />,
    },
    {
      id: "payout",
      title: t("payout"),
      api: HOME_FEED_APIS.payout,
      icon: <DollarSign size={ICON_SIZE} />,
    },
  ];

  const handleSelectionChange = (key: Key) => {
    if (!key) return;
    setSelectedKey(key.toString());
    const { title, description } = getMetadata.home(key.toString());
    updateMetadata({ title, description });
  };

  return (
    <>
      <h1 className="sr-only">{getMetadata.home(category).title}</h1>
      <STabs
        key={`tabs-home-${session?.user?.name || "anonymous"}`}
        variant="bordered"
        selectedKey={selectedKey}
        items={homeTabs}
        tabHref={(tab) => `/${tab.id}`}
        onSelectionChange={handleSelectionChange}
        tabTitle={(tab) => (
          <div className="flex items-center space-x-2">
            {tab.icon}
            {!isMobile || selectedKey === tab.id ? (
              <span>{tab.title}</span>
            ) : null}
          </div>
        )}
      >
        {(tab) => (
          <FeedList
            apiPath={tab.api}
            observer={session?.user?.name}
            initialData={tab.api === initialApiPath ? initialFeed : undefined}
          />
        )}
      </STabs>
    </>
  );
}
