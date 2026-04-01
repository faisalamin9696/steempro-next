import { getMetadata } from "@/utils/metadata";
import { Metadata } from "next";

function layout({ children }: { children: React.ReactNode }) {
  return children;
}

export default layout;

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { author, permlink } = await params;

  const { title, description, thumbnail, keywords, alternates } =
    await getMetadata.postAsync(author, permlink);

  return {
    title,
    description,
    keywords: keywords?.join(", "),
    alternates,
    openGraph: {
      images: thumbnail ? [thumbnail] : [],
    },
    twitter: {
      images: thumbnail ? [thumbnail] : [],
    },
  };
}
