import { getAccountExt, getPost, getPostWithReplies } from "@/libs/steem/sds";
import { getResizedAvatar, getThumbnail } from "@/utils/parseImage";
import { Metadata } from "next";
import React from "react";
import { auth } from "@/auth";
import ProfileInfoCard from "@/components/ProfileInfoCard";
import MainWrapper from "@/components/wrappers/MainWrapper";
import PostPage from "./PostPage";
import ErrorCardServer from "@/components/ErrorCardServer";
import { extractBodySummary } from "@/utils/extractContent";

export default async function Layout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ author: string; permlink: string }>;
}>) {
  let { author, permlink } = await params;
  author = author?.toLowerCase();
  permlink = permlink?.toLowerCase();

  const session = await auth();

  let posts: Post[], account: AccountExt;

  try {
    posts = await getPostWithReplies(author, permlink, session?.user?.name);
    account = await getAccountExt(author, session?.user?.name);
  } catch (error) {
    return <ErrorCardServer message="An error occurred while fetching post." />;
  }

  return (
    <MainWrapper
      endClassName={"1md:block min-w-[320px] w-[320px] !relative !top-0"}
      endContent={<ProfileInfoCard account={account} />}
    >
      <PostPage data={posts} />
    </MainWrapper>
  );
}

export async function generateMetadata({ params }): Promise<Metadata> {
  let { author, permlink } = await params;
  author = author?.toLowerCase();
  permlink = permlink?.toLowerCase();
  const result = await getPost(author, permlink);
  const isReply = result?.depth > 0;

  const thumbnail = isReply
    ? getResizedAvatar(result?.author, "small")
    : getThumbnail(result.json_images, "640x480");
  const pageTitle = isReply ? `RE: ${result?.root_title}` : result?.title;
  const pageDescription =
    extractBodySummary(result?.body, isReply) + " by " + result?.author;

  const keywords = [
    `SteemPro @${result.author}`,
    `${result.title} post`,
    `post by @${result.author}`,
    `content from ${result.author} on SteemPro`,
    `${result.author}'s blockchain blog`,
    `decentralized blogging on SteemPro`,
    `Steem blockchain post`,
    `crypto social content`,
    `web3 blogging platform`,
    `SteemPro content by ${result.author}`,
    `@${result.author} SteemPro posts`,
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
