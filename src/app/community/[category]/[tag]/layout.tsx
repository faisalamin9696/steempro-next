import { getAccountExt, getCommunity } from "@/libs/steem/sds";
import { getResizedAvatar } from "@/utils/parseImage";
import { Metadata, ResolvingMetadata } from "next";
import CommunityPage from "./CommunityPage";
import { auth } from "@/auth";
import ErrorCardServer from "@/components/ErrorCardServer";

export default async function Layout({
  params,
}: Readonly<{
  params: Promise<{ category: string; tag: string }>;
}>) {
  let { tag } = await params;
  tag = tag?.toLowerCase();

  const session = await auth();
  let community: Community, account: AccountExt;

  try {
    community = await getCommunity("hive-" + tag, session?.user?.name);
    account = await getAccountExt("hive-" + tag, session?.user?.name);
  } catch (error) {
    return (
      <ErrorCardServer message="An error occurred while fetching the community." />
    );
  }

  return <CommunityPage community={community} account={account} />;
}

export async function generateMetadata(
  { params },
  parent: ResolvingMetadata
): Promise<Metadata> {
  let { category, tag } = await params;
  category = category?.toLowerCase();
  tag = tag?.toLowerCase();
  const community = `hive-${tag}`;
  const previousImages = (await parent)?.openGraph?.images || [];
  const result = await getCommunity(community);
  const { title, about } = result ?? {};
  const pageTitle = title
    ? `${title} - ${category} in the ${community} Community`
    : `${community} Community ${category} List`;
  const pageDescription = about || "";

  const keywords = [
    `${community} community discussions`,
    `${community} ${category} content`,
    `${title} - ${community} on SteemPro`,
    `latest ${category} from ${community}`,
    `top ${category} topics in ${community}`,
    `#${community} news and updates`,
    `#${category} posts on SteemPro`,
    `${category} conversations at ${community}`,
    `${community} ${category} insights`,
    `${community} trending ${category}`,
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
