import { Card, CardBody, Chip } from "@heroui/react";
import Link from "next/link";
import { formatProposalVotes } from "@/hooks/useProposals";
import ProposalActions from "./ProposalActions";
import moment from "moment";
import { CheckCircle, ClockFading, DollarSign, Vote } from "lucide-react";
import SAvatar from "../ui/SAvatar";
import { useAppSelector } from "@/hooks/redux/store";
import { useSteemUtils } from "@/hooks/useSteemUtils";
import SUsername from "../ui/SUsername";

interface Props {
  proposal: Proposal;
  onView: () => void;
}

export default function ProposalItem({ proposal, onView }: Props) {
  const { vestsToSteem } = useSteemUtils();

  const proposalsData = useAppSelector(
    (state) => state.proposalsReducer.values
  );
  const returnProposal = proposalsData.find((p) => p.proposal_id === 0);

  const daily_pay = parseFloat(proposal.daily_pay.split(" SBD")[0]);
  const durationInDays = moment(proposal.end_date).diff(
    moment(proposal.start_date),
    "days"
  );
  const totalPayout = durationInDays * daily_pay;

  if (proposal.status === "removed") return null;

  return (
    <Card key={proposal.id} className="post-card">
      <CardBody>
        <div className="space-y-3">
          <div className="flex flex-row sm:items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h3 className="font-semibold text-default-900 text-sm sm:text-base">
                  <Link className="transition-colors hover:text-blue-500" href={`/proposals/${proposal.id}`}>
                    {proposal.subject}
                  </Link>
                </h3>
                <Chip
                  size="sm"
                  variant="bordered"
                  className="border-1"
                  color={getDailyPayColor(proposal.daily_pay)}
                >
                  {daily_pay.toLocaleString()} SBD/day
                </Chip>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted mb-2">
                <span className="flex flex-row gap-2">
                  by
                  <SAvatar
                    username={proposal.creator}
                    size="xs"
                    content={proposal.creator}
                  />
                  <SUsername username={proposal.creator} />
                </span>
                {proposal.creator !== proposal.receiver && (
                  <>
                    <span className="inline">•</span>
                    <span className="flex flex-row gap-2 items-center">
                      to
                      <SAvatar
                        username={proposal.receiver}
                        size="xs"
                        content={proposal.receiver}
                      />
                      <SUsername username={proposal.receiver} />
                    </span>
                  </>
                )}

                <span className="inline">•</span>
                <Link
                  className="transition-colors hover:text-blue-500 font-semibold text-sm"
                  href={`/proposals/${proposal.id}`}
                >
                  <p>ID #{proposal.id}</p>
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-muted mt-1">
                <p className="text-xs">
                  {moment(proposal.start_date).format("MMM DD, YYYY")} -{" "}
                  {moment(proposal.end_date).format("MMM DD, YYYY")}{" "}
                </p>
                <p className="text-xs ">
                  ({durationInDays} days){" "}
                  <span className="text-blue-500 uppercase">
                    {totalPayout.toLocaleString()}
                  </span>{" "}
                  SBD
                </p>
              </div>
            </div>
            {getProposalStatusIcon(proposal, returnProposal)}
          </div>

          <div className="flex flex-row flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-muted">
                <Vote size={20} />{" "}
                {formatProposalVotes(vestsToSteem(proposal.total_votes))}
              </div>
            </div>

            <div className="flex flex-row gap-0">
              <ProposalActions proposal={proposal} onView={onView} />
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export const isProposalFunded = (
  proposal: Proposal,
  returnProposal?: Proposal
): boolean => {
  if (!returnProposal) return false;
  try {
    const proposalVotes = BigInt(proposal.total_votes);
    const returnVotes = BigInt(returnProposal.total_votes);
    return proposalVotes > returnVotes;
  } catch (e) {
    return false;
  }
};

const getDailyPayColor = (dailyPay: string) => {
  const amount = parseFloat(dailyPay);
  if (amount >= 1000) return "danger";
  if (amount >= 100) return "warning";
  return "success";
};

export const getFundingBadge = (
  proposal: Proposal,
  returnProposal?: Proposal
) => {
  if (proposal.proposal_id === 0) {
    return "Funding Threshold";
  }
  const funded = isProposalFunded(proposal, returnProposal);
  switch (funded) {
    case true:
      return "Funded";
    case false:
      return "Not Funded";
    default:
      return "Funding Threshold";
  }
};

export const getProposalStatusIcon = (
  proposal: Proposal,
  returnProposal?: Proposal
) => {
  const statusLabel = getFundingBadge(proposal, returnProposal);
  const statusColor =
    statusLabel === "Funded"
      ? "text-success"
      : statusLabel === "Not Funded"
      ? "text-primary"
      : "text-warning";
  return statusLabel === "Funded" ? (
    <CheckCircle size={16} className={statusColor} />
  ) : statusLabel === "Not Funded" ? (
    <ClockFading size={16} className={statusColor} />
  ) : (
    <DollarSign size={16} className={statusColor} />
  );
};
