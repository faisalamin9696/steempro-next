"use client";

import FeedList from "@/components/FeedList";
import FeedList2 from "@/components/FeedList";
import { getEndPoint, useAppSelector } from "@/libs/constants/AppFunctions";
import React from "react";

export default function HomeTrendingsTab() {
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  return (
    <div className="flex flex-col space-y-2">
      <FeedList2
        endPoint={getEndPoint("ActivePostsByTrending", loginInfo.name)}
      />
    </div>
  );
}
