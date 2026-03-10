import { auth } from "@/auth";
import CommunityCard from "@/components/community/CommunityCard";
import CommunityHeader from "@/components/community/CommunityHeader";
import MainWrapper from "@/components/wrappers/MainWrapper";
import { sdsApi } from "@/libs/sds";
import React from "react";
import CommunityPage from "../(site)/CommunityPage";

async function page({
  params,
}: {
  params: Promise<{ category: string; tag: string }>;
}) {
  const { tag } = await params;
  const session = await auth();
  const [account, community] = await Promise.all([
    sdsApi.getAccountExt(`hive-${tag}`, session?.user?.name),
    sdsApi.getCommunity(`hive-${tag}`, session?.user?.name),
  ]);
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
      <CommunityPage community={community} account={account} />
    </MainWrapper>
  );
}

export default page;
