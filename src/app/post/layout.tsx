import { getPost } from "@/libs/steem/sds";
import { getResizedAvatar, getThumbnail } from "@/libs/utils/image";
import { postSummary } from "@/libs/utils/postSummary";
import usePathnameServer from "@/libs/utils/usePathnameServer";
import { Metadata } from "next";
import React from "react";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

export async function generateMetadata(): Promise<Metadata> {
  const { username, permlink } = await usePathnameServer();
  const result = await getPost(username, permlink);
  const isPost = result?.depth === 0;

  const thumbnail = isPost
    ? getThumbnail(result.json_images, "640x480")
    : getResizedAvatar(result?.author, "small");

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
    keywords: keywords.join(", "),
    openGraph: {
      images: [thumbnail],
    },
    twitter: {
      images: [thumbnail],
    },
  };
}
