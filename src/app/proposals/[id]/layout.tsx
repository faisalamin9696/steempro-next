import { getPost } from "@/libs/steem/sds";
import { getThumbnail } from "@/utils/parseImage";
import { Metadata } from "next";
import React from "react";
import { findProposals } from "@/libs/steem/condenser";
import { getMetadata } from "@/utils/metadata";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

export async function generateMetadata({ params }): Promise<Metadata> {
  const { id } = (await params) as { id: string };
  const { title, description, thumbnail } = await getMetadata.proposalAsync(id);
    return {
      title,
      description,
      openGraph: {
        images: [thumbnail],
      },
      twitter: {
        images: [thumbnail],
      },
    }
}
