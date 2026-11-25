import { auth } from "@/auth";
import CommunityCard from "@/components/community/CommunityCard";
import CommunityHeader from "@/components/community/CommunityHeader";
import MainWrapper from "@/components/wrappers/MainWrapper";
import { communityOr404 } from "@/libs/sds-server";
import { isHiveTag } from "@/utils/steemParams";
import { notFound } from "next/navigation";
import React from "react";
import CommunityPage from "../(site)/CommunityPage";

async function page({
  params,
}: {
  params: Promise<{ category: string; tag: string }>;
}) {
  const { tag } = await params;
  // Same shape check as the layout: the page renders in parallel with it, so
  // guarding only one of them still lets a junk tag reach SDS.
  if (!isHiveTag(tag)) notFound();

  const session = await auth();
  const { account, community } = await communityOr404(
    `hive-${tag}`,
    session?.user?.name,
  );

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
