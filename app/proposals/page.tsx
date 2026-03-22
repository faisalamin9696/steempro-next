"use client";

import { useState, useCallback, useEffect } from "react";
import {
  CheckCircle,
  ClockFading,
  DollarSign,
  Receipt,
  Search,
} from "lucide-react";
import { Input } from "@heroui/input";
import ProposalDetailModal from "@/components/proposals/ProposalDetailModal";
import ProposalItem from "@/components/proposals/ProposalItem";
import InfiniteList from "@/components/InfiniteList";
import { useAppDispatch, useAppSelector } from "@/hooks/redux/store";
import { addProposalsHandler } from "@/hooks/redux/reducers/ProposalsReducer";
import useSWR from "swr";
import { sdsApi } from "@/libs/sds";
import ErrorCard from "@/components/ui/ErrorCard";
import LoadingStatus from "@/components/LoadingStatus";
import PageHeader from "@/components/ui/PageHeader";
import { useTranslations } from "next-intl";

const ProposalsPage = () => {
  const t = useTranslations("Proposals");
  const { data, isLoading, error } = useSWR(`proposals-list`, () =>
    sdsApi.getProposals()
  );
  const [selected, setSelected] = useState<Proposal | null>(null);
  const [isProposalDetails, setIsProposalDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const proposalsData = useAppSelector(
    (state) => state.proposalsReducer.values
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (data) {
      dispatch(addProposalsHandler(data));
    }
  }, [data]);

  const filterFn = useCallback((item: Proposal, term: string) => {
    const lowerTerm = term.toLowerCase();
    return (
      item.subject.toLowerCase().includes(lowerTerm) ||
      item.creator.toLowerCase().includes(lowerTerm) ||
      item.receiver.toLowerCase().includes(lowerTerm) ||
      String(item.proposal_id).includes(lowerTerm) ||
      String(item.id).includes(lowerTerm)
    );
  }, []);

  return (
    <div className="flex flex-col gap-6 pb-4">
      <div className="flex flex-col items-start gap-4">
        <PageHeader
          icon={Receipt}
          title={t("title")}
          description={t("description")}
        />

        <div className="flex items-center self-end gap-2 text-sm text-muted">
          <CheckCircle className="h-4 w-4 text-success" />
          <span>{t("funded")}</span>
          <DollarSign className="h-4 w-4 text-warning ml-2" />
          <span>{t("threshold")}</span>
          <ClockFading className="h-4 w-4 text-primary ml-2" />
          <span>{t("pending")}</span>
        </div>
      </div>

      <Input
        placeholder={t("search")}
        startContent={<Search size={18} className="text-muted-foreground" />}
        value={searchTerm}
        onValueChange={setSearchTerm}
        isClearable
        radius="lg"
        variant="flat"
      />

      {isLoading ? (
        <LoadingStatus />
      ) : error ? (
        <ErrorCard error={error} reset={() => window?.location?.reload()} />
      ) : (
        <InfiniteList
          data={proposalsData}
          searchTerm={searchTerm}
          filterFn={filterFn}
          renderItem={(proposal: Proposal) => (
            <ProposalItem
              key={proposal.id}
              proposal={proposal}
              onView={() => {
                setSelected(proposal);
                setIsProposalDetails(true);
              }}
            />
          )}
          enableClientPagination
          clientItemsPerPage={20}
        />
      )}

      {isProposalDetails && (
        <ProposalDetailModal
          proposal={selected}
          isOpen={isProposalDetails}
          onClose={setIsProposalDetails}
        />
      )}
    </div>
  );
};

export default ProposalsPage;
