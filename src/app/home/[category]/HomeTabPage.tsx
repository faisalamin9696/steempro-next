"use client";

import FeedList from "@/components/FeedList";
import { FeedPerPage } from "@/constants/AppConstants";
import { getEndPoint, useAppSelector } from "@/constants/AppFunctions";
import { useSession } from "next-auth/react";
import React from "react";

type Props = {
  category: string;
};

function HomeTabPage(props: Props) {
  let { category } = props;
  category = category?.toLowerCase();
  const { data: session } = useSession();

  const getKey = (pageIndex: number, previousPageData: Feed[] | null) => {
    // Return null when we reach the end
    if (previousPageData && previousPageData.length === 0) return null;

    return getEndPoint(
      getTabEndPoint(category),
      session?.user?.name || "null",
      500,
      FeedPerPage, // page size
      pageIndex * FeedPerPage // offset
    );
  };

  return (
    <div className="flex flex-col space-y-2">
      <FeedList dataKey={getKey} />
    </div>
  );
}

export default HomeTabPage;

function getTabEndPoint(category: string) {
  switch (category) {
    case "trending":
      return "ActivePostsByTrending";
    case "created":
      return "ActivePostsByCreated";
    case "hot":
      return "ActivePostsByHot";
    case "payout":
      return "ActivePostsByPayout";
    default:
      return "ActivePostsByTrending";
  }
}
