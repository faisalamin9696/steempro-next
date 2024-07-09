"use client";

import FeedList from "@/components/FeedList";
import { getEndPoint, useAppSelector } from "@/libs/constants/AppFunctions";
import { FeedTypes } from "@/libs/steem/sds";
import React from "react";

export default function HomeCreatedTab() {
  const loginInfo = useAppSelector((state) => state.loginReducer.value);

  return (
    <div>
      <div className="flex flex-col space-y-2">
        <FeedList
          endPoint={getEndPoint("ActivePostsByCreated", loginInfo.name)}
        />
      </div>
    </div>
  );
}
