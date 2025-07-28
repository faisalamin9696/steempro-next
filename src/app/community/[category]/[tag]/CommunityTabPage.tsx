"use client";

import FeedList from "@/components/FeedList";
import { FeedPerPage } from "@/constants/AppConstants";
import { getEndPoint } from "@/constants/AppFunctions";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import React from "react";

type Props = {
  category: string;
  tag: string;
};

function CommunityTabPage() {
  const params = useParams();
  let { category, tag } = params as Props;
  category = category?.toLowerCase();
  tag = tag?.toLowerCase();
  const { data: session } = useSession();

  const getKey = (pageIndex: number, previousPageData: Feed[] | null) => {
    // Return null when we reach the end
    if (previousPageData && previousPageData.length === 0) return null;

    return getEndPoint(
      getTabEndPoint(category),
      `${"hive-" + tag}/${session?.user?.name || "null"}`,
      500,
      FeedPerPage, // page size
      pageIndex * FeedPerPage // offset
    );
  };

  return (
    <div className="flex flex-col space-y-2">
      <FeedList isCommunity dataKey={getKey} />
    </div>
  );
}

export default CommunityTabPage;

function getTabEndPoint(category: string) {
  switch (category) {
    case "trending":
      return "ActivePostsByTagTrending";
    case "created":
      return "PostsByTagCreated";
    default:
      return "ActivePostsByTagTrending";
  }
}
