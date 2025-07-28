"use client";

import ErrorCard from "@/components/ErrorCard";
import LoadingCard from "@/components/LoadingCard";
import { getProposals } from "@/libs/steem/condenser";
import React, { useEffect, useMemo, useState } from "react";
import { FaFileInvoiceDollar } from "react-icons/fa";
import useSWR from "swr";
import ProposalItem from "@/components/ProposalItem";
import { DaoStats } from "@/components/DaoStats";
import STable from "@/components/ui/STable";

const initialSatus = ["all"];

function Proposals() {
  const { data, error, isLoading } = useSWR<Proposal[]>(
    "proposals-list",
    getProposals
  );

  if (error) {
    return <ErrorCard message={error} />;
  }

  if (isLoading) return <LoadingCard />;

  return (
    <div className="flex flex-col gap-4 pb-10">
      <div className="flex flex-col items-center sm:items-start gap-2 text-center">
        <p className="text-xl font-bold sm:text-3xl">Steem Proposals</p>
        <p className="text-sm text-default-500 text-center sm:text-start">
          Fund community-driven ideas through the Steem Proposal System (SPS).
          Vote on initiatives that improve the ecosystem and benefit the
          network.
        </p>
      </div>

      <DaoStats proposals={data} />

      <STable
        filterByValue={["subject", "creator", "receiver"]}
        data={data || []}
        title="DAO Proposals"
        titleIcon={FaFileInvoiceDollar}
        subTitle={(filteredItems)=>`Showing ${filteredItems?.length} of ${data?.length} proposals`}
        tableRow={(proposal) => (
          <ProposalItem
            returnProposal={data?.find((p) => p.proposal_id === 0)}
            proposal={proposal}
          />
        )}
      />
    </div>
  );
}

export default Proposals;
