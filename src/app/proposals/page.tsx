"use client";

import ErrorCard from "@/components/ErrorCard";
import LoadingCard from "@/components/LoadingCard";
import { getProposals } from "@/libs/steem/condenser";
import React from "react";
import { FaFileInvoiceDollar } from "react-icons/fa";
import useSWR from "swr";
import ProposalItemCard from "@/components/ProposalItemCard";
import { DaoStats } from "@/components/DaoStats";
import STable from "@/components/ui/STable";
import { useTranslation } from "@/utils/i18n";

function Proposals() {
  const { t } = useTranslation();
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
        <p className="text-xl font-bold sm:text-3xl">{t("proposals.title")}</p>
        <p className="text-sm text-default-500 text-center sm:text-start">
          {t("proposals.description")}
        </p>
      </div>

      <DaoStats proposals={data} />

      <STable
        filterByValue={["subject", "creator", "receiver"]}
        data={data || []}
        title={t("proposals.dao_proposals")}
        bodyClassName="flex flex-col gap-6 mt-6"
        titleIcon={FaFileInvoiceDollar}
        subTitle={(filteredItems)=>t("proposals.showing", { filtered: filteredItems?.length, total: data?.length })}
        tableRow={(proposal) => (
          <ProposalItemCard
            returnProposal={data?.find((p) => p.proposal_id === 0)}
            proposal={proposal}
          />
        )}
      />
    </div>
  );
}

export default Proposals;
