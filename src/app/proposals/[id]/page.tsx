"use client";

import MarkdownViewer from "@/components/body/MarkdownViewer";
import ErrorCard from "@/components/ErrorCard";
import LoadingCard from "@/components/LoadingCard";
import ProposalItemCard from "@/components/ProposalItemCard";
import { findProposals } from "@/libs/steem/condenser";
import { getPost } from "@/libs/steem/sds";
import { useParams } from "next/navigation";
import React from "react";
import useSWR from "swr";

function page() {
  const params = useParams();
  const proposalId = params.id as string;

  const { data, error, isLoading } = useSWR<Proposal>("proposals", () =>
    findProposals(Number(proposalId))
  );

  const {
    data: postData,
    error: PostError,
    isLoading: isLoadingPost,
  } = useSWR<Post>(
    data?.creator && data.permlink ? "proposals-content" : null,
    () => getPost(data?.creator ?? "null", data?.permlink ?? "null")
  );

  if (isLoading) return <LoadingCard />;

  if (error) return <ErrorCard message={error} />;

  return (
    <div className=" flex flex-col gap-4">
      {data && (
        <div className=" flex flex-col gap-4">
          <ProposalItemCard proposal={data} />
          {isLoadingPost ? (
            <LoadingCard />
          ) : (
            postData && (
              <div className="flex flex-col w-full items-center">
                <MarkdownViewer text={postData?.body || ""} className=" !max-w-[700px]" />
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default page;
