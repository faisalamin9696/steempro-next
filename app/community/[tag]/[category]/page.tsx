import { auth } from "@/auth";
import { JsonLd } from "@/components/seo/JsonLd";
import { sdsApi } from "@/libs/sds";
import { COMMUNITY_FEED_APIS, communityFeedApi } from "@/utils/feedApis";
import { communityJsonLd } from "@/utils/jsonld";
import CommunityPage from "../../(site)/CommunityPage";

async function page({
  params,
}: {
  params: Promise<{ tag: string; category?: string }>;
}) {
  const { tag, category } = await params;
  const session = await auth();
  const commAccount = `hive-${tag}`;
  const tab = (category || "trending").toLowerCase();

  const [account, community] = await Promise.all([
    sdsApi.getAccountExt(commAccount, session?.user?.name),
    sdsApi.getCommunity(commAccount, session?.user?.name),
  ]);

  // Preload the active tab's first page so the HTML we serve to crawlers
  // contains real post cards instead of an empty list waiting on a fetch.
  const apiPath = COMMUNITY_FEED_APIS[tab]
    ? communityFeedApi(tab, commAccount)
    : "";

  let initialFeed: Feed[] = [];
  if (apiPath) {
    try {
      const posts = await sdsApi.getFeedByApiPath(apiPath, "steem", 16, 0);
      initialFeed = Array.isArray(posts) ? posts : [];
    } catch (error) {
      console.error("[community] initial feed fetch failed", error);
    }
  }

  return (
    <>
      <JsonLd data={communityJsonLd(commAccount, community)} />
      <CommunityPage
        account={account}
        community={community}
        initialApiPath={apiPath}
        initialFeed={initialFeed}
      />
    </>
  );
}

export default page;
