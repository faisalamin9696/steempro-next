import { getAccountExt, getCommunity } from "@/libs/steem/sds";
import { Metadata, ResolvingMetadata } from "next";
import CommunityPage from "./CommunityPage";
import { auth } from "@/auth";
import ErrorCardServer from "@/components/ErrorCardServer";
import { getMetadata } from "@/utils/metadata";

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
  const { title, description, keywords, images } =
    await getMetadata.communityAsync(category, tag, parent);

  return {
    title,
    description,
    keywords: keywords.join(", "),
    openGraph: {
      images: [...images],
    },
    twitter: {
      images: [...images],
    },
  };
}
