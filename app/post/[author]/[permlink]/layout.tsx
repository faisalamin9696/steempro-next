import { Suspense } from "react";
import { getMetadata } from "@/utils/metadata";
import { Metadata } from "next";
import PostLoading from "@/components/skeleton/PostLoader";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.steempro.com";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ author: string; permlink: string }>;
}

async function layout({ children }: LayoutProps) {
  return <Suspense fallback={<PostLoading />}>{children}</Suspense>;
}

export default layout;

export async function generateMetadata({ params }: any): Promise<Metadata> {
  let { author, permlink } = await params;

  const { title, description, thumbnail, keywords, alternates } =
    await getMetadata.postAsync(author, permlink);

  const url = alternates?.canonical || `${BASE_URL}/@${author}/${permlink}`;

  return {
    title,
    description,
    keywords: keywords.join(", "),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "article",
      url,
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
