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

  const { title, description, thumbnail, keywords, alternates, robots } =
    await getMetadata.postAsync(author, permlink);

  const url = alternates?.canonical || `${BASE_URL}/@${author}/${permlink}`;

  return {
    title,
    description,
    keywords: keywords.join(", "),
    // `postAsync` sets this only when the post is not on the chain. A real 404
    // status is unreachable on this route -- it is Partial Prerendered, so the
    // shell's 200 is committed before any dynamic notFound() could run -- which
    // makes noindex the thing that actually keeps it out of the index.
    ...(robots ? { robots } : {}),
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
