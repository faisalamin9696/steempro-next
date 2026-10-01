import { getMetadata } from "@/utils/metadata";
import { Metadata } from "next";
import { getResizedAvatar } from "@/utils/image";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.steempro.com";

// Tabs that are personal / transactional rather than public content. They all
// canonicalise to the profile root anyway, but they should never enter the
// index on their own.
const NON_INDEXABLE_TABS = new Set([
  "wallet",
  "notifications",
  "settings",
  "feed",
]);

async function layout({ children }: { children: React.ReactNode }) {
  return children;
}

export default layout;

export async function generateMetadata({ params }: any): Promise<Metadata> {
  let { username, tab } = await params;
  const { title, description, keywords, alternates } =
    await getMetadata.profileAsync(username, tab);

  const canonical =
    alternates?.canonical || `${BASE_URL}/@${username.toLowerCase()}`;
  const isIndexable = !NON_INDEXABLE_TABS.has((tab || "blog").toLowerCase());

  return {
    title,
    description,
    keywords: keywords.join(", "),
    alternates: { canonical },
    ...(isIndexable ? {} : { robots: { index: false, follow: true } }),
    openGraph: {
      type: "profile",
      url: canonical,
      title,
      description,
      images: [getResizedAvatar(username, "medium")],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [getResizedAvatar(username, "medium")],
    },
  };
}
