"use client";

import React from "react";
import usePathnameClient from "@/libs/hooks/usePathnameClient";
import FeedList from "@/components/FeedList";
import { useAppSelector } from "@/libs/constants/AppFunctions";

export default function CommunityPinnedTab() {
  const { community } = usePathnameClient();
  const loginInfo = useAppSelector((state) => state.loginReducer.value);

  return (
    <div className="flex flex-col space-y-2">
      <FeedList
        endPoint={`/communities_api/getCommunityPinnedPosts/${community}/${
          loginInfo.name || "null"
        }/500`}
      />
    </div>
  );
}
