"use client";

import FeedList from "@/components/FeedList";
import { getEndPoint, useAppSelector } from "@/libs/constants/AppFunctions";
import React from "react";

export default function HomePayoutTab() {
  const loginInfo = useAppSelector((state) => state.loginReducer.value);

  return (
    <div>
      <div className="flex flex-col space-y-2">
        <FeedList
          endPoint={getEndPoint("ActivePostsByPayout", loginInfo.name)}
        />
      </div>
    </div>
  );
}
