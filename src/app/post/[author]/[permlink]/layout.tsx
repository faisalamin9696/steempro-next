import { getAccountExt, getPostWithReplies } from "@/libs/steem/sds";
import { Metadata } from "next";
import React from "react";
import { auth } from "@/auth";
import ProfileInfoCard from "@/components/ProfileInfoCard";
import MainWrapper from "@/components/wrappers/MainWrapper";
import PostPage from "./PostPage";
import ErrorCardServer from "@/components/ErrorCardServer";
import { getMetadata } from "@/utils/metadata";

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

  const { title, description, thumbnail, keywords } =
    await getMetadata.postAsync(author, permlink);

  return {
    title,
    description,
    keywords: keywords.join(", "),
    openGraph: {
      images: [thumbnail],
    },
    twitter: {
      images: [thumbnail],
    },
  };
}
