"use client";

import PostPage from "@/app/post/[author]/[permlink]/page";
import ProposalDetailModal from "@/components/proposals/ProposalDetailModal";
import ProposalItem from "@/components/proposals/ProposalItem";
import { useAppSelector } from "@/hooks/redux/store";
import { useMemo, useState } from "react";

function ProposalPage({ data, post }: { data: Proposal; post: Post }) {
  const [selected, setSelected] = useState<Proposal | null>(null);
  const [isProposalDetails, setIsProposalDetails] = useState(false);
  const proposalsData = useAppSelector(
    (state) => state.proposalsReducer.values
  );
  const proposalData = useMemo(() => {
    const rawData = proposalsData?.find((item) => item.id === data.id) || data;
    if (!rawData) return null;

    const proposal = { ...rawData };
    const now = new Date();
    const start = new Date(proposal.start_date);
    const end = new Date(proposal.end_date);

    if (start < now && end >= now) {
      proposal.status = "active";
    } else if (end < now) {
      proposal.status = "expired";
    } else {
      proposal.status = "upcoming";
    }
    return proposal;
  }, [proposalsData, data]);

  if (!proposalData || proposalData?.status === "removed") return null;

  return (
    <div className="flex flex-col gap-4">
      <ProposalItem
        proposal={proposalData}
        onView={() => {
          setSelected(proposalData);
          setIsProposalDetails(true);
        }}
      />

      <div className="w-full relative">
        <PostPage data={post} key={`${post.author}-${post.permlink}`} />
      </div>
      {isProposalDetails && (
        <ProposalDetailModal
          proposal={selected}
          isOpen={isProposalDetails}
          onClose={setIsProposalDetails}
        />
      )}
    </div>
  );
}

export default ProposalPage;
