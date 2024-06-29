"use client";

import FeedList from "@/components/FeedList";
import { FeedBodyLength } from "@/libs/constants/AppConstants";
// import FeedList from '@/components/comment/FeedList';
import { useAppSelector } from "@/libs/constants/AppFunctions";
import { FeedTypes } from "@/libs/steem/sds";
import React from "react";

export default function HomePayoutTab() {
  const loginInfo = useAppSelector((state) => state.loginReducer.value);

  function getEndPoint(
    feedType: FeedTypes,
    bodyLength = FeedBodyLength,
    limit = 1000,
    offset = 0
  ) {
    const URL = `/feeds_api/get${feedType ?? "PostsByAuthor"}/${
      loginInfo.name || "null"
    }/${bodyLength}/${limit}/${offset}`;
    return URL.trim();
  }

  return (
    <div>
      <div className="flex flex-col space-y-2">
        <FeedList endPoint={getEndPoint("ActivePostsByPayout")} />
      </div>
    </div>
  );
}
