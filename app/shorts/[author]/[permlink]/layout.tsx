import { getMetadata } from "@/utils/metadata";
import { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.steempro.com";

function layout({ children }: { children: React.ReactNode }) {
  return children;
}

export default layout;

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { author, permlink } = await params;

  const { title, description, thumbnail, keywords } =
    await getMetadata.postAsync(author, permlink);

  // `postAsync` canonicalises to the article URL `/@{author}/{permlink}`.
  // The shorts route is the video presentation of that content and is what the
  // /shorts hub links to, so it must canonicalise to itself instead of being
  // swallowed by the article URL.
  const canonical = `${BASE_URL}/shorts/@${author}/${permlink}`;

  return {
    title,
    description,
    keywords: keywords?.join(", "),
    alternates: { canonical },
    openGraph: {
      url: canonical,
      type: "video.other",
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
