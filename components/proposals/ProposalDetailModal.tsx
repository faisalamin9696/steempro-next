import SModal from "@/components/ui/SModal";
import {
  Vote,
  Calendar,
  User,
  DollarSign,
  Info,
  Users,
  Wallet,
  Link2,
} from "lucide-react";
import SAvatar from "@/components/ui/SAvatar";
import SUsername from "@/components/ui/SUsername";
import moment from "moment";
import PostLink from "@/components/post/PostLink";
import { Constants } from "@/constants";
import {
  formatProposalVotes,
  useProposalVoters,
  ProposalVoterData,
} from "@/hooks/useProposals";
import { getFundingBadge, getProposalStatusIcon } from "./ProposalItem";
import { useAppSelector } from "@/hooks/redux/store";
import { Tab, Tabs } from "@heroui/tabs";
import { Chip } from "@heroui/chip";
import { useState } from "react";
import LoadingStatus from "../LoadingStatus";
import { ColumnDef, DataTable } from "../ui/data-table";
import { twMerge } from "tailwind-merge";
import { useSteemUtils } from "@/hooks/useSteemUtils";
import Link from "next/link";

const ProposalDetailModal = ({
  proposal,
  isOpen,
  onClose,
}: {
  proposal: Proposal | null;
  isOpen: boolean;
  onClose: (v: boolean) => void;
}) => {
  const { vestsToSteem } = useSteemUtils();
  const proposalsData = useAppSelector(
    (state) => state.proposalsReducer.values,
  );
  const returnProposal = proposalsData.find((p) => p.proposal_id === 0);
  const [activeTab, setActiveTab] = useState<string>("info");

  const {
    voters: votesData,
    isLoading: isVotesLoading,
    totalVotes,
    effective,
    notEffective,
  } = useProposalVoters(isOpen && proposal ? proposal.id : undefined);

  if (!proposal) return null;

  const badge = getFundingBadge(proposal, returnProposal);

  const columns: ColumnDef<ProposalVoterData>[] = [
    {
      key: "name",
      header: "Voter",
      searchable: true,
      render: (value, row) => {
        const isInvalidProxy =
          row.proxy && !votesData.some((v) => v.name === row.proxy);
        const isValidProxy =
          row.proxy && votesData.some((v) => v.name === row.proxy);

        const title = isInvalidProxy
          ? `proxy to @${row.proxy} who didn't vote`
          : isValidProxy
            ? `Proxy to @${row.proxy}`
            : undefined;

        return (
          <div className="flex flex-col items-start gap-2">
            {/* <SAvatar size="sm" username={value} /> */}
            <SUsername className="font-medium text-sm" username={`@${value}`} />
            {title && (
              <span
                className={twMerge(
                  "text-[10px] sm:text-xs text-muted leading-tight",
                  isInvalidProxy && "text-warning font-medium italic",
                )}
              >
                {title}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "vests_own",
      header: "Own SP",
      sortable: true,
      render: (value) => (
        <span className="font-mono text-xs">
          {vestsToSteem(value).toLocaleString()}
        </span>
      ),
    },
    {
      key: "proxied_votes",
      header: "Proxied SP",
      sortable: true,
      render: (value) => (
        <span className="font-mono text-xs">
          {vestsToSteem(value).toLocaleString()}
        </span>
      ),
    },
    {
      key: "share",
      header: "Share",
      sortable: true,
      render: (value) => (
        <span className="font-mono text-xs">{value.toFixed(2)}%</span>
      ),
    },
  ];

  return (
    <SModal
      title={() => (
        <div className="flex items-center gap-3">
          <SAvatar username={proposal.creator} />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span>@{proposal.creator}</span>
              <Chip
                size="sm"
                variant="bordered"
                className={
                  badge === "Funded"
                    ? "text-green-500 border-green-500/30"
                    : badge === "Not Funded"
                      ? "text-primary border-primary/30"
                      : "text-warning border-warning/30"
                }
                classNames={{
                  content: "flex flex-row gap-1 items-center px-1",
                }}
              >
                {getProposalStatusIcon(proposal, returnProposal)}

                {badge}
              </Chip>
            </div>
            <Link
              href={`/proposals/${proposal.id}`}
              className="text-sm text-muted hover:text-blue-500 transition-colors"
            >
              ID #{proposal.id}
            </Link>
          </div>
        </div>
      )}
      isOpen={isOpen}
      onOpenChange={onClose}
      scrollBehavior="inside"
    >
      {() => (
        <div className="flex flex-col h-full">
          <Tabs
            aria-label="Witness Details Tabs"
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
            color="primary"
            classNames={{
              panel: "px-0",
            }}
          >
            <Tab
              key="info"
              title={
                <div className="flex items-center gap-2">
                  <Info size={16} />
                  <span>Information</span>
                </div>
              }
            >
              <div className="space-y-6 mt-4">
                {/* Status & Votes */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Vote className="text-primary" size={18} />
                    <span className="font-medium">
                      {formatProposalVotes(vestsToSteem(proposal.total_votes))}{" "}
                      votes
                    </span>
                  </div>
                </div>

                {/* Creator & Receiver */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-content2/50 rounded-lg p-4 border border-border/50">
                    <div className="flex items-center gap-2 text-xs text-muted mb-2">
                      <User className="h-3.5 w-3.5" />
                      Creator
                    </div>
                    <div className="flex items-center gap-2">
                      <SAvatar size={30} username={proposal.creator} />

                      <span className="text-sm">
                        <SUsername username={`@${proposal.creator}`} />
                      </span>
                    </div>
                  </div>

                  <div className="bg-content2/50 rounded-lg p-4 border border-border/50">
                    <div className="flex items-center gap-2 text-xs text-muted mb-2">
                      <User className="h-3.5 w-3.5" />
                      Receiver
                    </div>
                    <div className="flex items-center gap-2">
                      <SAvatar size={30} username={proposal.receiver} />

                      <span className="text-sm">
                        <SUsername username={`@${proposal.receiver}`} />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Duration */}
                <div className="bg-content2/50 rounded-lg p-4 border border-border/50">
                  <div className="flex items-center gap-2 text-xs text-muted mb-2">
                    <Calendar className="h-3.5 w-3.5" />
                    Duration
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted">Start: </span>
                      <span className="font-medium">
                        {moment(proposal.start_date).format("MMM d, yyyy")}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted">End: </span>
                      <span className="font-medium">
                        {moment(proposal.end_date).format("MMM d, yyyy")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Daily Pay */}
                <div className="bg-content2/50 rounded-lg p-4 border border-border/50">
                  <div className="flex items-center gap-2 text-xs text-muted mb-2">
                    <DollarSign className="h-3.5 w-3.5" />
                    Daily Pay
                  </div>
                  <span className="text-lg font-bold text-emerald-500">
                    {proposal.daily_pay}
                  </span>
                </div>

                {/* Permlink */}
                <div className="bg-content2/50 rounded-lg p-4 border border-border/50">
                  <div className="flex items-center gap-2 text-xs text-muted mb-2">
                    <Link2 className="h-3.5 w-3.5" />
                    Permlink
                  </div>

                  <PostLink
                    href={`${Constants.site_url}/@${proposal.creator}/${proposal.permlink}`}
                    title={proposal.permlink}
                  />
                </div>
              </div>
            </Tab>

            <Tab
              key="voters"
              title={
                <div className="flex items-center gap-2">
                  <Users size={16} />
                  <span>Voters</span>
                </div>
              }
            >
              {isVotesLoading ? (
                <div className="h-60 flex items-center justify-center">
                  <LoadingStatus />
                </div>
              ) : (
                <div className="flex flex-col gap-6 pb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-content2/50 p-3 rounded-xl flex items-center gap-2 border border-divider">
                      <div className="p-3 bg-primary/10 rounded-xl text-primary">
                        <Users size={24} />
                      </div>
                      <div>
                        <p className="text-xs text-muted font-medium">
                          Total Voters
                        </p>
                        <p className="text-lg font-bold">
                          {votesData?.length.toLocaleString() || 0}
                        </p>
                        <p className="text-xs text-muted">
                          Effective: {effective.count.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="bg-content2/50 p-3 rounded-xl flex items-center gap-2 border border-divider">
                      <div className="p-3 bg-success/10 rounded-xl text-success">
                        <Wallet size={24} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted font-medium">
                          Total Support (SP)
                        </p>
                        <p className="text-lg font-bold">
                          {totalVotes.toLocaleString()}
                        </p>

                        <p className="text-xs text-muted">
                          Effective: {effective.votes.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <DataTable
                    data={votesData || []}
                    columns={columns}
                    className="rounded-xl overflow-hidden"
                    emptyMessage="No votes found for this proposal"
                  />
                </div>
              )}
            </Tab>
          </Tabs>
        </div>
      )}
    </SModal>
  );
};

export default ProposalDetailModal;
