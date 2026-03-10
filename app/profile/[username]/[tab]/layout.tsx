import { getMetadata } from "@/utils/metadata";
import { Metadata } from "next";
import { getResizedAvatar } from "@/utils/image";

async function layout({ children }: { children: React.ReactNode }) {
  return children;
}

export default layout;

export async function generateMetadata({ params }: any): Promise<Metadata> {
  let { username, tab } = await params;
  const { title, description, keywords, alternates } =
    await getMetadata.profileAsync(username, tab);

  return {
    title,
    description,
    keywords: keywords.join(", "),
    alternates,
    openGraph: {
      images: [getResizedAvatar(username, "medium")],
    },
    twitter: {
      images: [getResizedAvatar(username, "medium")],
    },
  };
}
