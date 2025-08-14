import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { FaExternalLinkAlt, FaVoteYea } from "react-icons/fa";
import { TbClockOff } from "react-icons/tb";
import SAvatar from "./ui/SAvatar";
import { PiClockCountdownBold } from "react-icons/pi";
import ProposalVoteButton from "./ProposalVoteButton";
import moment from "moment";
import { useDisclosure } from "@heroui/modal";
import { abbreviateNumber } from "@/utils/helper";
import { useAppSelector } from "@/constants/AppFunctions";
import { vestToSteem } from "@/utils/helper/vesting";
import { useState } from "react";
import { BiDollar } from "react-icons/bi";
import ProposalVotersModal from "./ProposalVotersModal";
import SLink from "./ui/SLink";
import { useTranslation } from "@/utils/i18n";

export const getProposalStatus = (start_date: string, end_date: string) => {
  const now = new Date();
  const start = new Date(start_date);
  const end = new Date(end_date);
  if (now < start) return "pending";
  if (now > end) return "expired";
  return "active";
};
export function simpleVotesToSp(
  total_votes: number,
  total_vesting_shares,
  total_vesting_fund_steem
) {
  const total_vests = parseFloat(total_vesting_shares);
  const total_vest_steem = parseFloat(total_vesting_fund_steem);
  return total_vest_steem * (total_votes / total_vests) * 0.000001;
}

export const formatSteemPower = (sp: number): string => {
  if (sp >= 1_000_000_000) {
    return `${(sp / 1_000_000_000).toFixed(2)}B`;
  }
  if (sp >= 1_000_000) {
    return `${(sp / 1_000_000).toFixed(2)}M`;
  }
  if (sp >= 1_000) {
    return `${(sp / 1_000).toFixed(1)}K`;
  }
  return sp.toFixed(0);
};

const VoteDisplay = ({
  totalVotes,
  steemPerMvests,
  onPress,
}: {
  totalVotes: string;
  steemPerMvests: number | null;
  onPress?: () => void;
}) => {
  // If the conversion rate isn't loaded, show a fallback
  if (steemPerMvests === null) {
    return <span className="text-default-500">...</span>;
  }

  try {
    const vestsAsNumber = Number(BigInt(totalVotes) / BigInt(1000000));
    const steemPower = vestToSteem(vestsAsNumber, steemPerMvests);
    const formattedSp = formatSteemPower(steemPower);
    return (
      <div className="flex flex-row gap-1 cursor-pointer" onClick={onPress}>
        <span className="text-steem font-medium">~{formattedSp}</span>
        <span className="text-default-500">SP</span>
      </div>
    );
  } catch (error) {
    console.error("Could not format votes", error);
    return <span className="text-default-500">N/A</span>;
  }
};

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

const ProposalItemCard = ({
  returnProposal,
  proposal,
}: {
  returnProposal?: Proposal;
  proposal: Proposal;
}) => {
  const { t } = useTranslation();
  const proposalDisclosure = useDisclosure();
  const globalData = useAppSelector((state) => state.steemGlobalsReducer.value);
  const [isVoted, setIsVoted] = useState(false);

  const daily_pay = proposal.daily_pay.split(" SBD")[0];
  const durationInDays = moment(proposal.end_date).diff(
    moment(proposal.start_date),
    "days"
  );
  const totalPayout = durationInDays * parseFloat(daily_pay);

  const proposalStatus = getProposalStatus(
    proposal.start_date,
    proposal.end_date
  );

  const getFundingBadge = (proposal: Proposal) => {
    if (proposal.proposal_id === 0) {
      return (
        <Chip variant="flat" color="warning" className="text-xs">
          <div className="flex flex-row items-center gap-1">
            <BiDollar size={16} />
            {t("proposals.funding_threshold")}
          </div>
        </Chip>
      );
    }
    const funded = isProposalFunded(proposal, returnProposal);
    return (
      <Chip
        size="sm"
        variant="bordered"
        color="default"
        className={`text-xs border-1`}
      >
        <div className="flex flex-row items-center gap-1">
          <BiDollar size={16} />
          {funded ? t("proposals.funded") : t("proposals.not_funded")}
        </div>
      </Chip>
    );
  };

  const getStatusIcon = () => {
    switch (proposalStatus) {
      case "active":
        return <PiClockCountdownBold size={20} className=" text-blue-500" />;
      case "expired":
        return <TbClockOff size={20} className=" text-red-500" />;
      case "pending":
        return <PiClockCountdownBold size={20} className=" text-yellow-500" />;
      default:
        return <PiClockCountdownBold size={20} className="text-default-500" />;
    }
  };

  const getStatusColor = () => {
    switch (proposalStatus) {
      case "active":
        return "text-blue-500 border-blue-500";
      case "expired":
        return "text-red-500 border-red-500";
      case "pending":
        return "text-yellow-500 border-yellow-500";
      default:
        return "text-default-500 border-default-500";
    }
  };

  const getCategoryColor = (dailyPay: string) => {
    const amount = parseFloat(dailyPay);
    if (amount >= 1000) return "danger";
    if (amount >= 100) return "warning";
    return "success";
  };

  return (
    <div key={proposal.id}>
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-default-900 text-sm sm:text-base">
                <SLink href={`/proposals/${proposal.id}`}>
                  {proposal.subject}
                </SLink>
              </h3>
              <Chip
                size="sm"
                variant="bordered"
                color={getCategoryColor(proposal.daily_pay)}
                className={`text-sm border-1`}
              >
                {daily_pay} SBD/day
              </Chip>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-default-500 mb-2">
              <span className="flex flex-row gap-2">
                {t("proposals.by")}
                <SAvatar
                  username={proposal.creator}
                  size="xxs"
                  content={proposal.creator}
                />
              </span>
              <span className="inline">•</span>

              <span className="flex flex-row gap-2">
                {t("proposals.to")}
                <SAvatar
                  username={proposal.receiver}
                  size="xxs"
                  content={proposal.receiver}
                />
              </span>

              <span className="inline">•</span>
              <SLink
                className="hover:text-blue-500 font-semibold text-sm"
                href={`/proposals/${proposal.id}`}
              >
                <p className="text-default-500">{t("proposals.id").replace("{{id}}", proposal.id.toString())}</p>
              </SLink>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-default-500 mt-1">
              <p className="text-xs">
                {moment(proposal.start_date).format("MMM DD, YYYY")} -{" "}
                {moment(proposal.end_date).format("MMM DD, YYYY")}{" "}
              </p>
              <p className="text-xs ">
                ({durationInDays} {t("proposals.days")}){" "}
                <span className="text-blue-500 uppercase">
                  {abbreviateNumber(totalPayout)}
                </span>{" "}
                SBD
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Chip
              size="sm"
              variant="bordered"
              className={`text-sm border-1 capitalize ${getStatusColor()}`}
            >
              {t(`proposals.status.${proposalStatus}`)}
            </Chip>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {getFundingBadge(proposal)}
          {isVoted && (
            <Chip variant="flat" color="success" className="text-xs">
              <div className="flex flex-row items-center gap-1">
                <FaVoteYea size={16} />
                {t("proposals.you_voted")}
              </div>
            </Chip>
          )}
        </div>
        <div className="flex flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-1">
              <VoteDisplay
                onPress={proposalDisclosure.onOpenChange}
                totalVotes={proposal.total_votes}
                steemPerMvests={globalData.steem_per_share}
              />
            </div>
          </div>

          <div className="flex flex-row gap-0">
            <ProposalVoteButton
              className="rounded-s-md px-2 sm:px-3"
              proposal={proposal}
              getVoteStatus={setIsVoted}
            />
            <Button
              as={SLink}
              size="sm"
              variant="flat"
              className="rounded-s-none px-2 sm:px-3"
              href={`/@${proposal.creator}/${proposal.permlink}`}
            >
              <FaExternalLinkAlt size={14} className="sm:mr-1 " />
              <span className="inline">{t("proposals.view")}</span>
            </Button>
          </div>
        </div>
      </div>

      <ProposalVotersModal
        proposal={proposal}
        isOpen={proposalDisclosure.isOpen}
        onOpenChange={proposalDisclosure.onOpenChange}
      />
    </div>
  );
};

export default ProposalItemCard;
