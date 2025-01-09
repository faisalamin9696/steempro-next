import MainWrapper from "@/components/wrappers/MainWrapper";
import { getCommunity } from "@/libs/steem/sds";
import { getResizedAvatar } from "@/libs/utils/image";
import usePathnameServer from "@/libs/utils/usePathnameServer";
import { ResolvingMetadata } from "next";
import CommunityPage from "./(site)/page";
import ProfileInfoCard from "@/components/ProfileInfoCard";
import { auth } from "@/auth";
import CommunityCarousel from "@/components/carousal/CommunityCarousal";
import CommunityHeader from "@/components/CommunityHeader";

export default async function Layout({
  children,
  start,
  end,
}: Readonly<{
  children: React.ReactNode;
  start: React.ReactNode;
  end: React.ReactNode;
}>) {
  const { community } = usePathnameServer();
  const session = await auth();

  const data = await getCommunity(community, session?.user?.name || "null");

  return (
    <main className="main flex flex-col">
      <CommunityHeader community={data} />
      <MainWrapper
        endClassName="max-h-screen"
        endContent={
          <ProfileInfoCard
            hideAvatar
            key={Math.random()}
            community={data}
            username={data.account}
          />
        }
      >
        <CommunityCarousel />
        <CommunityPage data={data} />
      </MainWrapper>
    </main>
  );
}

export async function generateMetadata(parent: ResolvingMetadata) {
  const { category, community } = usePathnameServer();
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
