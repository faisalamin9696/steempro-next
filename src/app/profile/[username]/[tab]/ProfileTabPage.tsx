"use client";

import FeedList from "@/components/FeedList";
import { FeedPerPage } from "@/constants/AppConstants";
import { getEndPoint } from "@/constants/AppFunctions";
import { useSession } from "next-auth/react";
import React from "react";
import { twMerge } from "tailwind-merge";

type Props = {
  username: string;
  tab: string;
};

export default function ProfileTabPage(props: Props) {
  let { username, tab } = props;
  tab = tab?.toLowerCase();
  const { data: session } = useSession();

  const getKey = (pageIndex: number, previousPageData: Feed[] | null) => {
    // Return null when we reach the end
    if (previousPageData && previousPageData.length === 0) return null;

    return getEndPoint(
      getTabEndPoint(tab),
      `${username}/${session?.user?.name || "null"}`,
      500,
      FeedPerPage, // page size
      pageIndex * FeedPerPage // offset
    );
  };

  return (
    <div className={twMerge("flex flex-col space-y-2")}>
      <FeedList dataKey={getKey} />
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
