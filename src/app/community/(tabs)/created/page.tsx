"use client";

import FeedList from "@/components/FeedList";
import { FeedBodyLength } from "@/libs/constants/AppConstants";
import usePathnameClient from "@/libs/utils/usePathnameClient";

export default function CommunityCreatedPage() {
  const { community } = usePathnameClient();

  function getEndPoint(
    feedType: ValidCategories,
    bodyLength = FeedBodyLength,
    limit = 1000,
    offset = 0
  ) {
    const URL = `/feeds_api/getCommunityPostsBy${feedType}/${community}/${"null"}/${bodyLength}/${limit}/${offset} `;
    return URL.trim();
  }

  return (
    <div>
      <div className="flex flex-col space-y-2">
        <FeedList endPoint={getEndPoint("created")} />
      </div>
    </div>
  );
}
