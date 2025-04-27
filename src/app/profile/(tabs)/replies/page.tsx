"use client";

import FeedList from "@/components/FeedList";
import { getEndPoint, useAppSelector } from "@/libs/constants/AppFunctions";
import usePathnameClient from "@/libs/hooks/usePathnameClient";
import React from "react";

export default function ProfileRepliesTab() {
  const { username } = usePathnameClient();
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  return (
      <div className="flex flex-col space-y-2">
        <FeedList
          endPoint={getEndPoint(
            "CommentsByParentAuthor",
            `${username}/${loginInfo.name || "null"}`
          )}
        />
      </div>
  );
}
