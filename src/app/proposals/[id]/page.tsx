"use client";

import MarkdownViewer from "@/components/body/MarkdownViewer";
import ErrorCard from "@/components/ErrorCard";
import LoadingCard from "@/components/LoadingCard";
import ProposalItem from "@/components/ProposalItem";
import { findProposals } from "@/libs/steem/condenser";
import { getPost } from "@/libs/steem/sds";
import { Card } from "@heroui/card";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import React from "react";
import useSWR from "swr";

function page() {
  const { id } = useParams() as { id: string };
  const { data: session } = useSession();

  const { data, error, isLoading } = useSWR<Proposal>(`proposal-${id}`, () =>
    findProposals(Number(id))
  );

  const {
    data: postData,
    error: PostError,
    isLoading: isLoadingPost,
  } = useSWR<Post>(
    data?.creator && data?.permlink
      ? `proposals-content-${data?.creator}-${data?.permlink}`
      : null,
    () =>
      getPost(
        data?.creator ?? "null",
        data?.permlink ?? "null",
        session?.user?.id || "null"
      )
  );

  if (isLoading) return <LoadingCard />;

  if (error) return <ErrorCard message={error} />;

  return (
    <div className=" flex flex-col gap-4">
      {data && (
        <div className=" flex flex-col gap-4">
          <Card>
            <ProposalItem proposal={data} />
          </Card>
          {isLoadingPost ? (
            <LoadingCard />
          ) : (
            postData?.body && (
              <div className="flex flex-col w-full items-center p-2">
                <MarkdownViewer
                  text={postData?.body || ""}
                  className=" !max-w-[700px]"
                />
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default page;
