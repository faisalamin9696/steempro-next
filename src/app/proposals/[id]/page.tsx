"use client";

import MarkdownViewer from "@/components/body/MarkdownViewer";
import ErrorCard from "@/components/ErrorCard";
import LoadingCard from "@/components/LoadingCard";
import ProposalItemCard from "@/components/ProposalItemCard";
import MainWrapper from "@/components/wrappers/MainWrapper";
import { useAppDispatch, useAppSelector } from "@/constants/AppFunctions";
import { addProposalsHandler } from "@/hooks/redux/reducers/ProposalsReducer";
import { findProposals } from "@/libs/steem/condenser";
import { getPost } from "@/libs/steem/sds";
import { Card } from "@heroui/card";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";
import useSWR from "swr";

function Proposal() {
  const { id } = useParams() as { id: string };
  const { data: session } = useSession();
  const { data, error, isLoading, mutate } = useSWR<Proposal>(`proposal-${id}`, () =>
    findProposals(Number(id))
  );
  const proposalsData = useAppSelector(state => state.proposalsReducer.values);
  const dispatch = useAppDispatch();
  const proposalData = proposalsData?.filter(item => item.id === Number(id))?.[0] || data;

  useEffect(() => {
    if (data) {
      dispatch(addProposalsHandler([...proposalsData?.filter(item => item.id !== Number(id)), data]))
    }
  }, [data]);


  const {
    data: postData,
    error: PostError,
    isLoading: isLoadingPost,
  } = useSWR<Post>(
    proposalData?.creator && proposalData?.permlink
      ? `proposals-content-${proposalData?.creator}-${proposalData?.permlink}`
      : null,
    () =>
      getPost(
        proposalData?.creator ?? "null",
        proposalData?.permlink ?? "null",
        session?.user?.id || "null"
      )
  );

  if (proposalData?.status === 'removed') {
    return <p>Proposal not found</p>
  }

  if (isLoading) return <LoadingCard />;

  if (error) return <ErrorCard message={error} />;

  return (
    <div className=" flex flex-col gap-4">
      {proposalData && (
        <div className=" flex flex-col gap-4">
          <Card className="p-4">
            <ProposalItemCard proposal={proposalData} />
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

export default Proposal;
