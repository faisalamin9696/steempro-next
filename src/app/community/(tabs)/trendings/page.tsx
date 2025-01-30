"use client";

import FeedList from "@/components/FeedList";
import { getEndPoint, useAppSelector } from "@/libs/constants/AppFunctions";
import usePathnameClient from "@/libs/utils/usePathnameClient";
import { twMerge } from "tailwind-merge";

export default function CommunityTrendingsTab() {
  const { community } = usePathnameClient();
  const loginInfo = useAppSelector((state) => state.loginReducer.value);

  return (
    <div className={twMerge("flex flex-col space-y-2")}>
      <FeedList
        endPoint={getEndPoint(
          "ActiveCommunityPostsByTrending",
          `${community}/${loginInfo.name || "null"}`
        )}
      />
    </div>
  );
}
