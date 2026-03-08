import { auth } from "@/auth";
import ProfileCard from "@/components/profile/ProfileCard";
import Loader from "@/components/ui/Loader";
import MainWrapper from "@/components/wrappers/MainWrapper";
import { sdsApi } from "@/libs/sds";
import { Suspense } from "react";
import { getMetadata } from "@/utils/metadata";
import { Metadata } from "next";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ author: string; permlink: string }>;
}

async function layout({ children, params }: LayoutProps) {
  const { author, permlink } = await params;
  const session = await auth();
  const account = await sdsApi.getAccountExt(author, session?.user?.name);

  return (
    <Suspense fallback={<Loader />}>
      <MainWrapper
        endClass="w-[320px] min-w-[320px] hidden lg:block"
        end={<ProfileCard account={account} className="card" />}
      >
        {children}
      </MainWrapper>
    </Suspense>
  );
}

export default layout;

export async function generateMetadata({ params }: any): Promise<Metadata> {
  let { author, permlink } = await params;

  const { title, description, thumbnail, keywords, alternates } =
    await getMetadata.postAsync(author, permlink);

  return {
    title,
    description,
    keywords: keywords.join(", "),
    alternates,
    openGraph: {
      images: thumbnail ? [thumbnail] : [],
    },
    twitter: {
      images: thumbnail ? [thumbnail] : [],
    },
  };
}
