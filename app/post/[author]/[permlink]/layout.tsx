import { auth } from "@/auth";
import ProfileCard from "@/components/profile/ProfileCard";
import Loader from "@/components/ui/Loader";
import MainWrapper from "@/components/wrappers/MainWrapper";
import { sdsApi } from "@/libs/sds";
import { Suspense } from "react";
import PostPage from "./page";
import { getMetadata } from "@/utils/metadata";
import { Metadata } from "next";
import StructuredData from "@/components/seo/StructuredData";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ author: string; permlink: string }>;
}

async function layout({ children, params }: LayoutProps) {
  const { author, permlink } = await params;
  const session = await auth();
  const [account, post] = await Promise.all([
    sdsApi.getAccountExt(author, session?.user?.name),
    sdsApi.getPost(author, permlink, session?.user?.name),
  ]);
  const jsonLd = getMetadata.postStructuredData(post);

  return (
    <Suspense fallback={<Loader />}>
      <StructuredData data={jsonLd} />
      <MainWrapper
        endClass="w-[320px] min-w-[320px] hidden lg:block"
        end={<ProfileCard account={account} className="card" />}
      >
        {<PostPage key={`${author}-${permlink}`} data={post} />}
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
