import React, { Suspense } from "react";
import { getMetadata } from "@/utils/metadata";
import { Metadata } from "next";
import LoadingStatus from "@/components/LoadingStatus";

async function layout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingStatus />}>{children}</Suspense>;
}

export default layout;

export async function generateMetadata({ params }): Promise<Metadata> {
  const { id } = (await params) as { id: string };
  const { title, description, thumbnail } = await getMetadata.proposalAsync(id);
  return {
    title,
    description,
    openGraph: {
      images: thumbnail ? [thumbnail] : [],
    },
    twitter: {
      images: thumbnail ? [thumbnail] : [],
    },
  };
}
