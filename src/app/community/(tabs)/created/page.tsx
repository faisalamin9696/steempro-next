"use client";

import FeedList from "@/components/FeedList";
import { getEndPoint, useAppSelector } from "@/libs/constants/AppFunctions";
import { useDeviceInfo } from "@/libs/utils/useDeviceInfo";
import usePathnameClient from "@/libs/utils/usePathnameClient";
import { twMerge } from "tailwind-merge";

export default function CommunityCreatedTab() {
  const { community } = usePathnameClient();
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const { isMobile } = useDeviceInfo();

  return (
    <div>
      <div className={twMerge("flex flex-col space-y-2", !isMobile && "mt-12")}>
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
