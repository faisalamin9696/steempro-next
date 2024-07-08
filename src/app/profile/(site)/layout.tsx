import { getAuthorExt } from "@/libs/steem/sds";
import { getResizedAvatar } from "@/libs/utils/image";
import usePathnameServer from "@/libs/utils/usePathnameServer";
import { auth } from "@/auth";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

export async function generateMetadata() {
  let { category, username } = usePathnameServer();
  if (!category) {
    category = "blog";
  }
  const session = await auth();
  const result = await getAuthorExt(username, session?.user?.name || "null");
  const { name, about, website } =
    JSON.parse(result.posting_json_metadata || "{}")?.profile ?? {};

  const capCat = category.charAt(0).toUpperCase() + category.slice(1);
  const pageTitle = !!name
    ? `${name} (@${username}) - ${capCat} on the Decentralized Web`
    : `@${username} - ${capCat} on the Decentralized Web`;
  const pageDescription = about || "";

  const keywords = [
    `steempro @${username}`,
    `${category} by ${username}`,
    `${username} SteemPro`,
    `decentralized web ${category}`,
    `steem ${category}`,
    `steem ${username}`,
    `blockchain blogging`,
    `crypto social media`,
    `${username} ${category} content`,
    `SteemPro platform`,
  ];

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: keywords.join(", "),
    openGraph: {
      images: [getResizedAvatar(username, "medium")],
    },
    twitter: {
      images: [getResizedAvatar(username, "medium")],
    },
  };
}
