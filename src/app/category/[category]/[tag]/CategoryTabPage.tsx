"use client";

import FeedList from "@/components/FeedList";
import { getEndPoint, useAppSelector } from "@/constants/AppFunctions";
import { useParams } from "next/navigation";
import React from "react";

type Props = {
  category: string;
  tag: string;
};

function CategoryTabPage() {
  const params = useParams();
  let { category, tag } = params as Props;
  category = category?.toLowerCase();
  tag = tag?.toLowerCase();
  const loginInfo = useAppSelector((state) => state.loginReducer.value);

  return (
    <div className="flex flex-col space-y-2">
      <FeedList
        endPoint={getEndPoint(
          getTabEndPoint(category),
          `${tag}/${loginInfo.name || "null"}`
        )}
      />
    </div>
  );
}

export default CategoryTabPage;

function getTabEndPoint(category: string) {
  switch (category) {
    case "trending":
      return "ActivePostsByTagTrending";
    case "created":
      return "PostsByTagCreated";
    case "hot":
      return "ActivePostsByTagHot";
    case "payout":
      return "ActivePostsByTagPayout";
    default:
      return "ActivePostsByTrending";
  }
}
