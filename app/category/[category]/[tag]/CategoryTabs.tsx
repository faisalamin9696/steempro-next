"use client";

import { getMetadata, updateMetadata } from "@/utils/metadata";
import { useSession } from "next-auth/react";
import { Key, useState } from "react";
import STabs from "@/components/ui/STabs";
import { Zap, TrendingUp, ClockPlus, DollarSign, Sparkles } from "lucide-react";
import { useDeviceInfo } from "@/hooks/redux/useDeviceInfo";
import { FeedList } from "@/components/FeedList";
import { useTranslations } from "next-intl";
import { tagFeedApi } from "@/utils/feedApis";

const ICON_SIZE = 20;

export function CategoryTabs({
  category,
  tag,
  initialApiPath,
  initialFeed,
}: {
  category: string;
  tag: string;
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
      api: tagFeedApi("trending", tag),
      icon: <TrendingUp size={ICON_SIZE} />,
    },
    {
      id: "popular",
      title: t("popular"),
      api: tagFeedApi("popular", tag),
      icon: <Sparkles size={ICON_SIZE} />,
    },
    {
      id: "created",
      title: t("recent"),
      api: tagFeedApi("created", tag),
      icon: <ClockPlus size={ICON_SIZE} />,
    },
    {
      id: "hot",
      title: t("hot"),
      api: tagFeedApi("hot", tag),
      icon: <Zap size={ICON_SIZE} />,
    },
    {
      id: "payout",
      title: t("payout"),
      api: tagFeedApi("payout", tag),
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
      <h1 className="sr-only">
        {getMetadata.category(category, tag).title}
      </h1>
      <STabs
        key={`tabs-category-${session?.user?.name || "anonymous"}`}
        variant="bordered"
        selectedKey={selectedKey}
        onSelectionChange={handleSelectionChange}
        items={homeTabs}
        tabTitle={(tab) => (
          <div className="flex items-center space-x-2">
            {tab.icon}
            {!isMobile || selectedKey === tab.id ? (
              <span>{tab.title}</span>
            ) : null}
          </div>
        )}
        tabHref={(tab) => `/${tab.id}/${tag}`}
      >
        {(tab) => (
          <FeedList
            apiPath={tab.api}
            observer={session?.user?.name ?? "steem"}
            initialData={tab.api === initialApiPath ? initialFeed : undefined}
          />
        )}
      </STabs>
    </>
  );
}
