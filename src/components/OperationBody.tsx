import { vestToSteem } from "@/utils/helper/vesting";
import {
  formatAmount,
  extractVestsAmount,
  formatAmountFromObject,
} from "../libs/formatters";
import React from "react";
import SAvatar from "./ui/SAvatar";
import SLink from "./ui/SLink";

type Operation = [string, any];

function OperationBody({
  operation,
  steem_per_share,
}: {
  operation: Operation;
  steem_per_share: number;
}) {
  const [opType, opData] = operation;

  try {
    const userLink = (username: string) => (
      <SAvatar
        linkClassName="font-semibold hover:text-blue-500"
        username={username}
        size="xs"
        content={`${username}`}
      />
    );

    const postLink = (
      author: string,
      permlink: string,
      children?: React.ReactNode
    ) => (
      <SLink href={`/@${author}/${permlink}`} className="hover:text-blue-500 font-semibold hover:underline">
        {children ?? `@${author}/${permlink}`}
      </SLink>
    );

    const wrap = (...children: React.ReactNode[]) => (
      <div className="flex flex-wrap items-center gap-1">{children}</div>
    );

    switch (opType) {
      case "transfer":
        return wrap(
          <>
            {userLink(opData.from)} transferred {formatAmount(opData.amount)} to{" "}
            {userLink(opData.to)}
          </>
        );

      case "transfer_to_vesting":
        const recipient = opData.to || opData.from;
        return wrap(
          <>
            {userLink(opData.from)} powered up {formatAmount(opData.amount)} to{" "}
            {userLink(recipient)}
          </>
        );

      case "withdraw_vesting":
        return wrap(
          <>
            {userLink(opData.account)} started power down of{" "}
            {formatAmount(opData.vesting_shares)}
          </>
        );

      case "comment":
        return opData.parent_author
          ? wrap(
              <>
                {userLink(opData.author)} replied to{" "}
                {postLink(opData.parent_author, opData.parent_permlink)}
              </>
            )
          : wrap(
              <>
                {userLink(opData.author)} created post{" "}
                {postLink(
                  opData.author,
                  opData.permlink,
                  opData.title || opData.permlink
                )}
              </>
            );

      case "vote":
        const voteType =
          opData.weight > 0
            ? "upvoted"
            : opData.weight < 0
            ? "downvoted"
            : "removed vote on";
        return wrap(
          <>
            {userLink(opData.voter)} {voteType}{" "}
            {postLink(opData.author, opData.permlink)}
          </>
        );

      case "claim_reward_balance":
        const rewardVests = extractVestsAmount(opData.reward_vests);
        const rewardSP = vestToSteem(rewardVests, steem_per_share);
        const steemAmount = formatAmountFromObject(opData.reward_steem);
        const sbdAmount = formatAmountFromObject(opData.reward_sbd);

        const parts: string[] = [];
        if (steemAmount > 0) parts.push(`${steemAmount.toFixed(3)} STEEM`);
        if (sbdAmount > 0) parts.push(`${sbdAmount.toFixed(3)} SBD`);
        if (rewardSP > 0) parts.push(`${rewardSP.toFixed(3)} SP`);
        const rewards =
          parts.length > 0
            ? parts.join(", ").replace(/, ([^,]*)$/, " and $1")
            : "rewards";

        return wrap(
          <>
            {userLink(opData.account)} claimed {rewards}
          </>
        );

      case "comment_reward":
        return wrap(
          <>
            {userLink(opData.author)} received {formatAmount(opData.payout)} as
            comment reward for {postLink(opData.author, opData.permlink)}
          </>
        );

      case "author_reward":
        const steem = formatAmountFromObject(opData.steem_payout);
        const sbd = formatAmountFromObject(opData.sbd_payout);
        const authorSP = vestToSteem(
          extractVestsAmount(opData.vesting_payout),
          steem_per_share
        );
        return wrap(
          <>
            {userLink(opData.author)} received {steem.toFixed(3)} STEEM,{" "}
            {sbd.toFixed(3)} SBD, and {authorSP.toFixed(3)} SP as author reward
            for {postLink(opData.author, opData.permlink)}
          </>
        );

      case "curation_reward":
        const curatorSP = vestToSteem(
          extractVestsAmount(opData.reward),
          steem_per_share
        );
        return wrap(
          <>
            {userLink(opData.curator)} received {curatorSP.toFixed(3)} SP as
            curation reward for voting on{" "}
            {postLink(opData.comment_author, opData.comment_permlink)}
          </>
        );

      // Add other cases here similarly...

      default:
        return <p>Unrecognized operation: {opType}</p>;
    }
  } catch (error) {
    console.error("Error interpreting operation:", error);
    return (
      <p className="text-muted-foreground text-sm mb-3">
        Raw operation data available below
      </p>
    );
  }
}

export default OperationBody;
