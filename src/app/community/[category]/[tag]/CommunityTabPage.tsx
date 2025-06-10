"use client";

import FeedList from "@/components/FeedList";
import { getEndPoint, useAppSelector } from "@/constants/AppFunctions";
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
  const loginInfo = useAppSelector((state) => state.loginReducer.value);

  return (
    <div className="flex flex-col space-y-2">
      <FeedList
        isCommunity
        endPoint={
          category === "pinned"
            ? `/communities_api/getCommunityPinnedPosts/${"hive-" + tag}/${
                loginInfo.name || "null"
              }/500`
            : getEndPoint(
                getTabEndPoint(category),
                `${"hive-" + tag}/${loginInfo.name || "null"}`
              )
        }
      />
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
