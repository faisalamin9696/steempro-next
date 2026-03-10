import { auth } from "@/auth";
import CommunityCard from "@/components/community/CommunityCard";
import CommunityHeader from "@/components/community/CommunityHeader";
import ProfileHeaderSkeleton from "@/components/skeleton/ProfileHeaderSkeleton";
import MainWrapper from "@/components/wrappers/MainWrapper";
import { sdsApi } from "@/libs/sds";
import { Suspense } from "react";
import HomeCarousel from "@/components/carousal/HomeCarousal";
import moment from "moment";
import { getThumbnail } from "@/utils/image";
import { Metadata, ResolvingMetadata } from "next";
import { getMetadata } from "@/utils/metadata";
import { Accordion, AccordionItem } from "@heroui/accordion";
import CommunityAboutSection from "../(site)/CommunityAboutSection";

async function layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const session = await auth();
  const commAccount = `hive-${tag}`;

  const [account, community, pinnedPostsRaw] = await Promise.all([
    sdsApi.getAccountExt(commAccount, session?.user?.name),
    sdsApi.getCommunity(commAccount, session?.user?.name),
    sdsApi.getCommunityPinnedPosts(commAccount, session?.user?.name),
  ]);

  if (!account || !community) return null;

  const pinnedPosts: PromotedPost[] = (pinnedPostsRaw ?? []).map((item) => ({
    author: item.author,
    permlink: item.permlink,
    title: item.title,
    thumbnail: getThumbnail(item.json_images, "640x0")!,
    id: item.link_id.toString(),
    created_at: moment.unix(item.created).toISOString(),
  }));

  return (
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

      <CommunityAboutSection account={account} community={community} />

      {pinnedPosts.length > 0 && (
        <div className="mt-3">
          <HomeCarousel data={pinnedPosts} showPagination />
        </div>
      )}
      {children}
    </MainWrapper>
  );
}

export default layout;

export async function generateMetadata(
  { params }: { params: Promise<{ category: string; tag: string }> },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  let { tag, category } = await params;
  const { title, description, keywords, images } =
    await getMetadata.communityAsync(category, `hive-${tag}`, parent);

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
