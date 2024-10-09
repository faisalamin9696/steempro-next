import ProfileInfoCard from "@/components/ProfileInfoCard";
import MainWrapper from "@/components/wrappers/MainWrapper";
import { getPost } from "@/libs/steem/sds";
import { getResizedAvatar, getThumbnail } from "@/libs/utils/image";
import { postSummary } from "@/libs/utils/postSummary";
import usePathnameServer from "@/libs/utils/usePathnameServer";
import { ResolvingMetadata } from "next";
import React from "react";
import PostStart from "./(site)/@start/page";
import PostPage from "./(site)/page";
import { auth } from "@/auth";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { username, permlink } = usePathnameServer();
  const session = await auth();

  const data = await getPost(username, permlink, session?.user?.name || "null");
  // const tag = data.community ? JSON.parse(data.json_metadata)?.['tags'][0] : data.category

  return (
    <MainWrapper
      endClassName={"1md:block"}
      startClassName=" max-h-screen lg:block lg:mr-4" // non-sticky classes !relative !top-0
      startContent={
        <ProfileInfoCard
          hideAvatar
          key={Math.random()}
          profile
          username={username}
        />
      }
      endContent={<PostStart />}
    >
      <PostPage data={data} />
    </MainWrapper>
  );
}

export async function generateMetadata(parent: ResolvingMetadata) {
  const { username, permlink } = usePathnameServer();
  const result = await getPost(username, permlink);
  const previousImages = (await parent).openGraph?.images || [];
  const isPost = result?.depth === 0;

  const thumbnail = isPost
    ? getThumbnail(result.json_images, "640x480")
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
    keywords: keywords.join(", "),
    openGraph: {
      images: [thumbnail, ...previousImages],
    },
    twitter: {
      images: [thumbnail, ...previousImages],
    },
  };
}
