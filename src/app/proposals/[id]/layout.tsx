import { getPost } from "@/libs/steem/sds";
import { getThumbnail } from "@/utils/parseImage";
import { Metadata } from "next";
import React from "react";
import { findProposals } from "@/libs/steem/condenser";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

export async function generateMetadata({ params }): Promise<Metadata> {
  const { id } = (await params) as { id: string };
  const proposal = await findProposals(Number(id));
  if (proposal) {
    const result = await getPost(proposal.creator, proposal.permlink);

    const thumbnail = getThumbnail(result.json_images, "640x480");

    const pageTitle = result?.title;
    const pageDescription = pageTitle + ` proposal by @${result?.author}`;

    return {
      title: pageTitle,
      description: pageDescription ?? "",
      openGraph: {
        images: [thumbnail],
      },
      twitter: {
        images: [thumbnail],
      },
    };
  } else return {};
}
