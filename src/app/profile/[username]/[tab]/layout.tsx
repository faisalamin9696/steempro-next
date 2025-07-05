import { getAccountExt } from "@/libs/steem/sds";
import { getResizedAvatar } from "@/utils/parseImage";
import { auth } from "@/auth";
import { Metadata } from "next";
import MainWrapper from "@/components/wrappers/MainWrapper";
import ProfileInfoCard from "@/components/ProfileInfoCard";
import ProfilePage from "./ProfilePage";
import ErrorCardServer from "@/components/ErrorCardServer";

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ username: string; tab: string }>;
}) {
  const session = await auth();
  let { username } = await params;
  username = username?.toLowerCase();
  let data: AccountExt;
  try {
    data = await getAccountExt(username, session?.user?.name);
  } catch (error) {
    return (
      <ErrorCardServer message="An error occurred while fetching the user profile." />
    );
  }

  return (
    <MainWrapper
      endClassName="max-h-screen w-[320px] min-w-[320px] 1md:!hidden lg:!block"
      endContent={<ProfileInfoCard account={data} />}
    >
      <ProfilePage data={data} />
    </MainWrapper>
  );
}

export async function generateMetadata({ params }): Promise<Metadata> {
  let { username, tab } = await params;
  username = username?.toLowerCase();
  tab = tab?.toLowerCase();

  if (!tab) {
    tab = "blog";
  }
  const session = await auth();

  const result = await getAccountExt(username, session?.user?.name || "null");
  const { name, about, website } =
    JSON.parse(result.posting_json_metadata || "{}")?.profile ?? {};

  const capCat = tab.charAt(0).toUpperCase() + tab.slice(1);
  const pageTitle = !!name
    ? `${name} (@${username}) - ${capCat} on the Decentralized Web`
    : `@${username} - ${capCat} on the Decentralized Web`;
  const pageDescription = about || "";

  const keywords = [
    `SteemPro @${username}`,
    `${tab} by @${username}`,
    `${username}'s SteemPro profile`,
    `SteemPro user ${username}`,
    `decentralized ${tab} content`,
    `Steem ${tab} by ${username}`,
    `blockchain blogging profile`,
    `crypto social posts by ${username}`,
    `${username} ${tab} on SteemPro`,
    `Web3 creator ${username}`,
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
