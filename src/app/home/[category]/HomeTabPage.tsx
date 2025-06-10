"use client";

import FeedList from "@/components/FeedList";
import { getEndPoint, useAppSelector } from "@/constants/AppFunctions";
import { useParams } from "next/navigation";
import React from "react";

type Props = {
  category: string;
};

function HomeTabPage() {
  let { category } = useParams() as Props;
  category = category?.toLowerCase();
  const loginInfo = useAppSelector((state) => state.loginReducer.value);

  return (
    <div className="flex flex-col space-y-2">
      <FeedList
        endPoint={getEndPoint(getTabEndPoint(category), loginInfo.name)}
      />
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
