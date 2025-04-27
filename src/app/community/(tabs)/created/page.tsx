"use client";

import FeedList from "@/components/FeedList";
import { getEndPoint, useAppSelector } from "@/libs/constants/AppFunctions";
import usePathnameClient from "@/libs/hooks/usePathnameClient";
import { twMerge } from "tailwind-merge";

export default function CommunityCreatedTab() {
  const { community } = usePathnameClient();
  const loginInfo = useAppSelector((state) => state.loginReducer.value);

  return (
    <div>
      <div className={twMerge("flex flex-col space-y-2")}>
        <FeedList
          endPoint={getEndPoint(
            "CommunityPostsByCreated",
            `${community}/${loginInfo.name || "null"}`
          )}
        />
      </div>
    </div>
  );
}
