import { getPost } from "@/libs/steem/sds";
import { getPostThumbnail, getResizedAvatar } from "@/libs/utils/image";
import { postSummary } from "@/libs/utils/postSummary";
import usePathnameServer from "@/libs/utils/usePathnameServer";
import { ResolvingMetadata } from "next";
import React from "react";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div>{children}</div>;
}

export async function generateMetadata(parent: ResolvingMetadata) {
  const { username, permlink } = usePathnameServer();
  const result = await getPost(username, permlink);
  const previousImages = (await parent).openGraph?.images || [];
  const isPost = result?.depth === 0;

  const thumbnail = isPost
    ? getPostThumbnail(result?.json_images)
    : getResizedAvatar(result?.author, "medium");

  const pageTitle = isPost ? result?.title : `RE: ${result?.root_title}`;
  const pageDescription = isPost
    ? pageTitle + ` by @${result?.author}`
    : `${postSummary(result?.body)} by ${result?.author}`;

  const keywords = [
    `steempro @${result.author}`,
    `${result.title}`,
    `post by ${result.author}`,
    `${result.author} SteemPro`,
    `decentralized web posts`,
    `steem posts`,
    `blockchain blogging`,
    `crypto social media`,
    `content by ${result.author}`,
    `SteemPro platform`,
    `${result.author} content`,
  ];

  return {
    title: pageTitle,
    description: pageDescription ?? "",
    // keywords: keywords.join(", "),
    openGraph: {
      images: [thumbnail, ...previousImages],
    },
    twitter: {
      images: [thumbnail, ...previousImages],
    },
  };
}
