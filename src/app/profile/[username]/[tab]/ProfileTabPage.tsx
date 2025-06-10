"use client";

import FeedList from "@/components/FeedList";
import { getEndPoint, useAppSelector } from "@/constants/AppFunctions";
import { useParams } from "next/navigation";
import React from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  username: string;
  tab: string;
};

export default function ProfileTabPage() {
  let { username, tab } = useParams() as Props;
  username = username?.toLowerCase();
  tab = tab?.toLowerCase();
  const loginInfo = useAppSelector((state) => state.loginReducer.value);

  return (
    <div className={twMerge("flex flex-col space-y-2")}>
      <FeedList
        endPoint={getEndPoint(
          getTabEndPoint(tab),
          `${username}/${loginInfo.name || "null"}`
        )}
      />
    </div>
  );
}

function getTabEndPoint(tab: string) {
  switch (tab) {
    case "blog":
      return "AccountBlog";
    case "comments":
      return "CommentsByAuthor";
    case "communities":
      return "AccountCommunitiesFeedByCreated";
    case "replies":
      return "CommentsByParentAuthor";
    case "friends":
      return "AccountFriendsFeed";
    case "posts":
      return "PostsByAuthor";
    default:
      return "AccountBlog";
  }
}
