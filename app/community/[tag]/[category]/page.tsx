import { auth } from "@/auth";
import { sdsApi } from "@/libs/sds";
import CommunityPage from "../../(site)/CommunityPage";

async function page({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const session = await auth();
  const commAccount = `hive-${tag}`;

  const [account, community] = await Promise.all([
    sdsApi.getAccountExt(commAccount, session?.user?.name),
    sdsApi.getCommunity(commAccount, session?.user?.name),
  ]);

  return <CommunityPage account={account} community={community} />;
}

export default page;
