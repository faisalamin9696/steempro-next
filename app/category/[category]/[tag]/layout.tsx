import MainWrapper from "@/components/wrappers/MainWrapper";
import { sdsApi } from "@/libs/sds";
import { Suspense } from "react";
import ProfileHeaderSkeleton from "@/components/skeleton/ProfileHeaderSkeleton";
import { auth } from "@/auth";
import CommunityCard from "@/components/community/CommunityCard";
import CommunityPage from "./page";
import CommunityHeader from "@/components/community/CommunityHeader";
import { getThumbnail } from "@/utils/image";
import moment from "moment";
import { Metadata, ResolvingMetadata } from "next";
import { getMetadata } from "@/utils/metadata";

async function layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const session = await auth();
  const [[account, community], pinnedPosts] = await Promise.all([
    Promise.all([
      sdsApi.getAccountExt(`hive-${tag}`, session?.user?.name),
      sdsApi.getCommunity(`hive-${tag}`, session?.user?.name),
    ]),
    sdsApi.getCommunityPinnedPosts(`hive-${tag}`, session?.user?.name),
  ]);

  return (
    <Suspense fallback={<ProfileHeaderSkeleton />}>
      <MainWrapper
        endClass="w-[320px] min-w-[320px] 1md:hidden! lg:block!"
        end={
          <CommunityCard
            account={account}
            community={community}
            className="card"
          />
        }
        className="mt-2"
      >
        <CommunityHeader account={account} community={community} />
        <CommunityPage
          account={account}
          community={community}
          pinnedPost={(pinnedPosts ?? [])?.map((item) => {
            return {
              author: item.author,
              permlink: item.permlink,
              title: item.title,
              thumbnail: getThumbnail(item.json_images, "640x0")!,
              id: item.link_id.toString(),
              created_at: moment.unix(item.created).toISOString(),
            };
          })}
        />
      </MainWrapper>
    </Suspense>
  );
}

export default layout;

export async function generateMetadata(
  { params }: { params: Promise<{ category: string; tag: string }> },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  let { tag, category } = await params;
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
