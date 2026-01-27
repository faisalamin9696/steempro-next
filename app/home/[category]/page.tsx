"use client";

import { getMetadata, updateMetadata } from "@/utils/metadata";
import { useSession } from "next-auth/react";
import { Key, useState } from "react";
import { useParams } from "next/navigation";
import STabs from "@/components/ui/STabs";
import { Sparkles, Zap, TrendingUp, ClockPlus, DollarSign } from "lucide-react";
import { FeedList } from "@/components/FeedList";
import { useDeviceInfo } from "@/hooks/redux/useDeviceInfo";

const ICON_SIZE = 20;

function HomePage() {
  const { category } = useParams();
  const { data: session } = useSession();
  const [selectedKey, setSelectedKey] = useState(
    (category as string) || "trending",
  );
  const { isMobile } = useDeviceInfo();

  const homeTabs = [
    {
      id: "trending",
      title: "Trending",
      api: "getActivePostsByTrending",
      icon: <TrendingUp size={ICON_SIZE} />,
    },

    {
      id: "popular",
      title: "Popular",
      api: "getActivePostsByInteraction",
      icon: <Sparkles size={ICON_SIZE} />,
    },

    {
      id: "created",
      title: "Recent",
      api: "getActivePostsByCreated",
      icon: <ClockPlus size={ICON_SIZE} />,
    },
    {
      id: "hot",
      title: "Hot",
      api: "getActivePostsByHot",
      icon: <Zap size={ICON_SIZE} />,
    },

    {
      id: "payout",
      title: "Payout",
      api: "getActivePostsByPayout",
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
          ) : null}{" "}
        </div>
      )}
    >
      {(tab) => <FeedList apiPath={tab.api} observer={session?.user?.name} />}
    </STabs>
  );
}

export default HomePage;
