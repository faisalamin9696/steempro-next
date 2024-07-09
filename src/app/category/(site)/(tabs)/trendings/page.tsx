"use client";

import FeedList from "@/components/FeedList";
import { getEndPoint, useAppSelector } from "@/libs/constants/AppFunctions";
import usePathnameClient from "@/libs/utils/usePathnameClient";
import React from "react";

export default function CategoryTrendingsTab() {
  const { tag } = usePathnameClient();
  const loginInfo = useAppSelector((state) => state.loginReducer.value);

  return (
    <div>
      <div className="flex flex-col space-y-2">
        <FeedList
          endPoint={getEndPoint(
            "ActivePostsByTagTrending",
            `${tag}/${loginInfo.name || "null"}`
          )}
        />
      </div>
    </div>
  );
}
