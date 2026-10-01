import React, { Suspense } from "react";
import { getMetadata } from "@/utils/metadata";
import { Metadata } from "next";
import LoadingStatus from "@/components/LoadingStatus";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.steempro.com";

async function layout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingStatus />}>{children}</Suspense>;
}

export default layout;

export async function generateMetadata({ params }): Promise<Metadata> {
  const { id } = (await params) as { id: string };
  const { title, description, thumbnail } = await getMetadata.proposalAsync(id);
  const canonical = `${BASE_URL}/proposals/${id}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      url: canonical,
      title,
      description,
      images: thumbnail ? [thumbnail] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: thumbnail ? [thumbnail] : [],
    },
  };
}
