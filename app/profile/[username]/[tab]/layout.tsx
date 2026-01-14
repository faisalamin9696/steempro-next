import MainWrapper from "@/components/wrappers/MainWrapper";
import { sdsApi } from "@/libs/sds";
import ProfilePage from "./page";
import { Suspense } from "react";
import ProfileHeaderSkeleton from "@/components/skeleton/ProfileHeaderSkeleton";
import ProfileCard from "@/components/profile/ProfileCard";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { auth } from "@/auth";
import { getMetadata } from "@/utils/metadata";
import { Metadata } from "next";
import { getResizedAvatar } from "@/utils/image";

async function layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const session = await auth();
  const account = await sdsApi.getAccountExt(username, session?.user?.name);

  return (
    <Suspense fallback={<ProfileHeaderSkeleton />}>
      <MainWrapper
        endClass="w-[320px] min-w-[320px] 1md:hidden! lg:block!"
        end={<ProfileCard account={account} className="card" />}
      >
        <ProfileHeader key={"profile-header"} account={account} />
        <ProfilePage key={"profile"} account={account} />
      </MainWrapper>
    </Suspense>
  );
}

export default layout;

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
