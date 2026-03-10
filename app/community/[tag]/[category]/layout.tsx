import { getMetadata } from "@/utils/metadata";
import { ResolvingMetadata, Metadata } from "next";
import React from "react";

function layout({ children }: { children: React.ReactNode }) {
  return children;
}

export default layout;

export async function generateMetadata(
  { params }: { params: Promise<{ category: string; tag: string }> },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  let { tag, category } = await params;
  const { title, description, keywords, images } =
    await getMetadata.communityAsync(category, `${tag}`, parent);

  return {
    title,
    description,
    keywords: keywords.join(", "),
    openGraph: {
      images: [...images],
    },
    twitter: {
      images: [...images],
    },
  };
}
