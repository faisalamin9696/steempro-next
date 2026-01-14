import React, { Suspense } from "react";
import ProposalPage from "./page";
import { sdsApi } from "@/libs/sds";
import MainWrapper from "@/components/wrappers/MainWrapper";
import LoadingCard from "@/components/ui/LoadingCard";
import { auth } from "@/auth";
import { getMetadata } from "@/utils/metadata";
import { Metadata } from "next";

async function layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const proposal = await sdsApi.getProposal(parseInt(id));
  const post = await sdsApi.getPost(
    proposal.creator,
    proposal.permlink,
    session?.user?.name
  );

  return (
    <Suspense fallback={<LoadingCard />}>
      <MainWrapper>
        <ProposalPage data={proposal} post={post} />
      </MainWrapper>
    </Suspense>
  );
}

export default layout;

export async function generateMetadata({ params }): Promise<Metadata> {
  const { id } = (await params) as { id: string };
  const { title, description, thumbnail } = await getMetadata.proposalAsync(id);
  return {
    title,
    description,
    openGraph: {
      images: thumbnail ? [thumbnail] : [],
    },
    twitter: {
      images: thumbnail ? [thumbnail] : [],
    },
  };
}
