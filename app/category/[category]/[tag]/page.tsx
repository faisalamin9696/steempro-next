"use client";

import { getMetadata, updateMetadata } from "@/utils/metadata";
import { useSession } from "next-auth/react";
import { Key, useState } from "react";
import { useParams } from "next/navigation";
import STabs from "@/components/ui/STabs";
import { Zap, TrendingUp, ClockPlus, DollarSign, Sparkles } from "lucide-react";
import PostCard from "@/components/post/PostCard";
import { useDeviceInfo } from "@/hooks/redux/useDeviceInfo";
import { FeedList } from "@/components/FeedList";
const ICON_SIZE = 20;

function CategoryPage() {
  const { category, tag } = useParams();
  const { data: session } = useSession();
  const [selectedKey, setSelectedKey] = useState(
    (category as string) || "trending",
  );
  const { isMobile } = useDeviceInfo();
  const apiParam = `/${tag}`;

  const homeTabs = [
    {
      id: "trending",
      title: "Trending",
      api: "getActivePostsByTagTrending" + apiParam,
      icon: <TrendingUp size={ICON_SIZE} />,
    },
    {
      id: "popular",
      title: "Popular",
      api: "getActivePostsByTagInteraction" + apiParam,
      icon: <Sparkles size={ICON_SIZE} />,
    },
    {
      id: "created",
      title: "Recent",
      api: "getActivePostsByTagCreated" + apiParam,
      icon: <ClockPlus size={ICON_SIZE} />,
    },
    {
      id: "hot",
      title: "Hot",
      api: "getActivePostsByTagHot" + apiParam,
      icon: <Zap size={ICON_SIZE} />,
    },

    {
      id: "payout",
      title: "Payout",
      api: "getActivePostsByTagPayout" + apiParam,
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
        <FeedList apiPath={tab.api} observer={session?.user?.name ?? "steem"} />
        // <InfiniteList
        //   api={tab.api}
        //   className={className}
        //   renderItem={(item: Feed) => (
        //     <PostCard comment={item} key={item.link_id} layout={layout} />
        //   )}
        // />
      )}
    </STabs>
  );
}

export default CategoryPage;
