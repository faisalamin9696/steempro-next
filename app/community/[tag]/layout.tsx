import { auth } from "@/auth";
import CommunityCard from "@/components/community/CommunityCard";
import CommunityHeader from "@/components/community/CommunityHeader";
import MainWrapper from "@/components/wrappers/MainWrapper";
import { sdsApi } from "@/libs/sds";
import { communityOr404 } from "@/libs/sds-server";
import { isHiveTag } from "@/utils/steemParams";
import HomeCarousel from "@/components/carousal/HomeCarousal";
import dayjs from "@/libs/dayjs";
import { getThumbnail } from "@/utils/image";
import CommunityAboutSection from "../(site)/CommunityAboutSection";
import { Metadata } from "next";
import { notFound } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.steempro.com";

async function layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  // `/community/<anything>` reaches the dynamic segment, so the shape check
  // happens before any read: `hive-${tag}` with a junk tag is a guaranteed
  // upstream error, not a community.
  if (!isHiveTag(tag)) notFound();

  const session = await auth();
  const commAccount = `hive-${tag}`;

  const [{ account, community }, pinnedPostsRaw] = await Promise.all([
    communityOr404(commAccount, session?.user?.name),
    // Pinned posts are decorative: a community that has none, or an upstream
    // hiccup on that one call, must not turn the page into a 500.
    sdsApi
      .getCommunityPinnedPosts(commAccount, session?.user?.name)
      .catch(() => []),
  ]);

  if (!account || !community) return null;

  const pinnedPosts: PromotedPost[] = (pinnedPostsRaw ?? []).map((item) => ({
    author: item.author,
    permlink: item.permlink,
    title: item.title,
    thumbnail: getThumbnail(item.json_images, "640x0")!,
    id: item.link_id.toString(),
    created_at: dayjs.unix(item.created).toISOString(),
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

/**
 * `/community/{tag}` renders the community's *trending* feed, which is the same
 * content as the public URL `/{category}/hive-{tag}`. Canonicalise it there so
 * the two URLs don't compete, and give it its own title/description instead of
 * inheriting the homepage's canonical from the root layout.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  const canonical = `${BASE_URL}/trending/hive-${tag}`;

  return {
    alternates: { canonical },
    openGraph: {
      url: canonical,
      type: "website",
    },
  };
}

