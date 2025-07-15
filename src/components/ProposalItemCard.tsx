import { useAppSelector } from "@/constants/AppFunctions";
import { abbreviateNumber } from "@/utils/helper";
import moment from "moment";
import React from "react";
import SAvatar from "./ui/SAvatar";
import { useDisclosure } from "@heroui/modal";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import SLink from "./ui/SLink";
import ProposalVoteButton from "./ProposalVoteButton";
import Link from "next/link";
import { IoMdLink } from "react-icons/io";
import ProposalVotersModal from "./ProposalVotersModal";
import TimeAgoWrapper from "./wrappers/TimeAgoWrapper";

function ProposalItemCard({ proposal }: { proposal: Proposal }) {
  const globalData = useAppSelector((state) => state.steemGlobalsReducer.value);
  const proposalDisclosure = useDisclosure();

  const daily_pay = proposal.daily_pay.split(" SBD")[0];
  const durationInDays = moment(proposal.end_date).diff(
    moment(proposal.start_date),
    "days"
  );
  
  const totalPayout = durationInDays * parseFloat(daily_pay);
  const votesStr =
    simpleVotesToSp(
      parseFloat(proposal.total_votes),
      globalData.total_vesting_shares,
      globalData.total_vesting_fund_steem
    )?.toLocaleString() + " SP";

  const statusColor = () => {
    switch (proposal.status) {
      case "active":
        return "success";
      case "expired":
        return "danger";
      default:
        return "secondary";
    }
  };
  return (
    <div>
      <Card className="flex flex-col comment-card">
        <CardBody className="flex flex-col gap-2">
          <div className=" flex flex-row items-center gap-2">
            <div className="flex flex-row gap-2 items-center">
              <p>by</p>
              <Card radius="lg" className=" bg-foreground/20 rounded-full">
                <CardBody className="py-1 px-1 pe-2 flex flex-row items-center gap-1">
                  <SAvatar size="xs" username={proposal.creator} />
                  <SLink href={`/@${proposal.creator}`}>
                    {proposal.creator}
                  </SLink>
                </CardBody>
              </Card>
            </div>
            <>
              {proposal.receiver &&
                !(proposal.creator === proposal.receiver) && (
                  <div className=" flex flex-row items-center gap-2">
                    <p>for</p>
                    <Card
                      radius="lg"
                      className=" bg-foreground/20 rounded-full"
                    >
                      <CardBody className="py-1 px-1 pe-2 flex flex-row items-center gap-1">
                        <SAvatar size="xs" username={proposal.receiver} />
                        <SLink href={`/@${proposal.receiver}`}>
                          {proposal.receiver}
                        </SLink>
                      </CardBody>
                    </Card>
                  </div>
                )}
            </>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row justify-between">
            <div className="flex flex-col gap-3">
              <SLink
                className="hover:text-blue-500 font-semibold text-lg flex flex-row items-center gap-2 max-w-fit"
                href={`/proposals/${proposal.id}`}
              >
                <p>{proposal.subject}</p>
                <p className=" opacity-disabled">#{proposal.id}</p>
              </SLink>

              <div className="flex flex-row items-center max-sm:items-start gap-2">
                <Chip size="sm" variant="flat" color={statusColor()}>
                  <p className=" capitalize">{proposal.status}</p>
                </Chip>
                <div className=" flex flex-col sm:items-center sm:flex-row gap-2">
                  <p className="text-xs">
                    {moment(proposal.start_date).format("MMM DD, YYYY")} -{" "}
                    {moment(proposal.end_date).format("MMM DD, YYYY")}{" "}
                  </p>
                  <p className="text-xs ">
                    ({durationInDays} days){" "}
                    <span className="text-blue-500">
                      {abbreviateNumber(totalPayout)}
                    </span>{" "}
                    SBD (Daily {abbreviateNumber(daily_pay)} SBD)
                  </p>
                </div>
              </div>

              <SLink
                href={`/@${proposal.creator}/${proposal.permlink}`}
                className="flex flex-row items-start gap-2 text-xs text-blue-500 max-w-fit"
              >
                <IoMdLink size={20} />
                {`${proposal.creator}/${proposal.permlink}`}
              </SLink>

              <div className=" flex flex-row gap-2 items-center">
                <p className="text-xs opacity-disabled">Votes:</p>
                <p
                  onClick={proposalDisclosure.onOpen}
                  className="text-blue-500 cursor-pointer"
                >
                  {votesStr}
                </p>
              </div>
            </div>

            <div className="max-sm:gap-4 flex flex-col max-sm:flex-row-reverse sm:justify-between items-end">
              <ProposalVoteButton proposal={proposal} />

              <p className="opacity-disabled flex flex-row items-center gap-1">
                {moment(proposal.start_date).isAfter(moment()) && (
                  <span className="text-xs flex flex-row items-center me-1">
                    <span className=" me-1">{"(Starting"} </span>
                    <TimeAgoWrapper
                      created={moment(proposal.start_date).unix() * 1000}
                    />
                    {")"}
                  </span>
                )}
                {durationInDays} <span className="text-xs">days left</span>
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      <ProposalVotersModal
        proposal={proposal}
        isOpen={proposalDisclosure.isOpen}
        onOpenChange={proposalDisclosure.onOpenChange}
      />
    </div>
  );
}

export default ProposalItemCard;

export function simpleVotesToSp(
  total_votes: number,
  total_vesting_shares,
  total_vesting_fund_steem
) {
  const total_vests = parseFloat(total_vesting_shares);
  const total_vest_steem = parseFloat(total_vesting_fund_steem);
  return total_vest_steem * (total_votes / total_vests) * 0.000001;
}
