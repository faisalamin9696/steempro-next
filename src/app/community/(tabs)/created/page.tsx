"use client";

import FeedList from "@/components/FeedList";
import { getEndPoint } from "@/libs/constants/AppFunctions";
import usePathnameClient from "@/libs/utils/usePathnameClient";

export default function CommunityCreatedPage() {
  const { community } = usePathnameClient();

  return (
    <div>
      <div className="flex flex-col space-y-2">
        <FeedList
          endPoint={getEndPoint(
            "CommunityPostsByCreated",
            `${community}/${"null"}`
          )}
        />
      </div>
    </div>
  );
}
