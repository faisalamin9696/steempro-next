import { getCommunity } from "@/libs/steem/sds";
import { getResizedAvatar } from "@/libs/utils/image";
import usePathnameServer from "@/libs/utils/usePathnameServer";
import { ResolvingMetadata } from "next";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

export async function generateMetadata(parent: ResolvingMetadata) {
  const { category, community } = await usePathnameServer();
  const previousImages = (await parent)?.openGraph?.images || [];
  const result = await getCommunity(community);
  const { title, about } = result ?? {};
  const pageTitle = title
    ? `${title} - ${category} in the ${community} Community`
    : `${community} Community ${category} List`;
  const pageDescription = about || "";

  const keywords = [
    `${community} community`,
    `${community} ${category}`,
    `${title}`,
    `${category} discussions`,
    `${category} topics`,
    `community ${category}`,
    `latest ${category} in ${community}`,
    `#${community}`,
    `#${category} on SteemPro`,
    `${community} updates`,
  ];
  return {
    title: pageTitle,
    description: pageDescription,
    keywords: keywords.join(", "),
    openGraph: {
      images: [getResizedAvatar(result.account, "medium"), ...previousImages],
    },
    twitter: {
      images: [getResizedAvatar(result.account, "medium"), ...previousImages],
    },
  };
}
