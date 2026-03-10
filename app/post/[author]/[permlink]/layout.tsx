import { Suspense } from "react";
import { getMetadata } from "@/utils/metadata";
import { Metadata } from "next";
import PostLoading from "@/components/skeleton/PostLoader";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ author: string; permlink: string }>;
}

async function layout({ children, params }: LayoutProps) {

  return <Suspense fallback={<PostLoading />}>{children}</Suspense>;
}

export default layout;

export async function generateMetadata({ params }: any): Promise<Metadata> {
  let { author, permlink } = await params;

  const { title, description, thumbnail, keywords, alternates } =
    await getMetadata.postAsync(author, permlink);

  return {
    title,
    description,
    keywords: keywords.join(", "),
    alternates,
    openGraph: {
      images: thumbnail ? [thumbnail] : [],
    },
    twitter: {
      images: thumbnail ? [thumbnail] : [],
    },
  };
}
