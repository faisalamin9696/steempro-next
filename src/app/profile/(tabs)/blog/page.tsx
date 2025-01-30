"use client";

import FeedList from "@/components/FeedList";
import { getEndPoint, useAppSelector } from "@/libs/constants/AppFunctions";
import usePathnameClient from "@/libs/utils/usePathnameClient";
import React from "react";
import { twMerge } from "tailwind-merge";

export default function ProfileBlogsTab() {
  const { username } = usePathnameClient();
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  // const { isMobile } = useDeviceInfo();

  return (
    <div className={twMerge("flex flex-col space-y-2")}>
      <FeedList
        endPoint={getEndPoint(
          "AccountBlog",
          `${username}/${loginInfo.name || "null"}`
        )}
      />
    </div>
  );
}
