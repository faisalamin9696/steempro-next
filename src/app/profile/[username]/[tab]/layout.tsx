import { getAccountExt } from "@/libs/steem/sds";
import { getResizedAvatar } from "@/utils/parseImage";
import { auth } from "@/auth";
import { Metadata } from "next";
import MainWrapper from "@/components/wrappers/MainWrapper";
import ProfileInfoCard from "@/components/ProfileInfoCard";
import ProfilePage from "./ProfilePage";
import ErrorCardServer from "@/components/ErrorCardServer";
import { getMetadata } from "@/utils/metadata";

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
  const { title, description, keywords } = await getMetadata.profileAsync(
    username,
    tab
  );

  return {
    title,
    description,
    keywords: keywords.join(", "),
    openGraph: {
      images: [getResizedAvatar(username, "medium")],
    },
    twitter: {
      images: [getResizedAvatar(username, "medium")],
    },
  };
}
