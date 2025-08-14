import { vestToSteem } from "@/utils/helper/vesting";
import {
  formatAmount,
  extractVestsAmount,
  formatAmountFromObject,
} from "../libs/formatters";
import React from "react";
import SAvatar from "./ui/SAvatar";
import SLink from "./ui/SLink";
import { useTranslation } from "@/utils/i18n";

type Operation = [string, any];

function OperationBody({
  operation,
  steem_per_share,
}: {
  operation: Operation;
  steem_per_share: number;
}) {
  const { t } = useTranslation();
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
      <SLink
        href={`/@${author}/${permlink}`}
        className="hover:text-blue-500 font-semibold hover:underline"
      >
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
            {userLink(opData.from)} {t("wallet.transferred")} {formatAmount(opData.amount)} {t("wallet.to")}{" "}
            {userLink(opData.to)}
          </>
        );

      case "transfer_to_vesting":
        const recipient = opData.to || opData.from;
        return wrap(
          <>
            {userLink(opData.from)} {t("wallet.powered_up")} {formatAmount(opData.amount)} {t("wallet.to")}{" "}
            {userLink(recipient)}
          </>
        );

      case "withdraw_vesting": {
        const isStop = parseFloat(opData.vesting_shares) === 0;
        const powerdownVests = extractVestsAmount(opData.vesting_shares);
        const powerdownSP = vestToSteem(powerdownVests, steem_per_share);

        if (isStop)
          return wrap(<>{userLink(opData.account)} {t("wallet.stopped_power_down")}</>);
        else
          return wrap(
            <>
              {userLink(opData.account)} {t("wallet.started_power_down")} {t("wallet.of")}{" "}
              {formatAmount(powerdownSP)} {"SP"}
            </>
          );
      }

      case "comment":
        return opData.parent_author
          ? wrap(
              <>
                {userLink(opData.author)} {t("wallet.replied_to")}{" "}
                {postLink(opData.parent_author, opData.parent_permlink)}
              </>
            )
          : wrap(
              <>
                {userLink(opData.author)} {t("wallet.created_post")}{" "}
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
            ? t("wallet.upvoted")
            : opData.weight < 0
            ? t("wallet.downvoted")
            : t("wallet.removed_vote_on");
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
            ? parts.join(", ").replace(/, ([^,]*)$/, ` ${t("wallet.and")} $1`)
            : t("wallet.rewards");

        return wrap(
          <>
            {userLink(opData.account)} {t("wallet.claimed")} {rewards}
          </>
        );

      case "comment_reward":
        return wrap(
          <>
            {userLink(opData.author)} {t("wallet.received")} {formatAmount(opData.payout)} {t("wallet.as")}{" "}
            {t("wallet.comment_reward")} {t("wallet.for")} {postLink(opData.author, opData.permlink)}
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
            {userLink(opData.author)} {t("wallet.received")} {steem.toFixed(3)} STEEM,{" "}
            {sbd.toFixed(3)} SBD, {t("wallet.and")} {authorSP.toFixed(3)} SP {t("wallet.as")}{" "}{t("wallet.author_reward_text")}{" "}
            {t("wallet.for")} {postLink(opData.author, opData.permlink)}
          </>
        );

      case "curation_reward":
        const curatorSP = vestToSteem(
          extractVestsAmount(opData.reward),
          steem_per_share
        );
        return wrap(
          <>
            {userLink(opData.curator)} {t("wallet.received")} {curatorSP.toFixed(3)} SP {t("wallet.as")}{" "}
            {t("wallet.curation_reward_text")} {t("wallet.for")}{" "}
            {postLink(opData.comment_author, opData.comment_permlink)}
          </>
        );

      // Add other cases here similarly...

      default:
        return <p>{t("wallet.unrecognized_operation")}: {opType}</p>;
    }
  } catch (error) {
    console.error("Error interpreting operation:", error);
    return (
      <p className="text-muted-foreground text-sm mb-3">
        {t("wallet.operation_error")}
      </p>
    );
  }
}

export default OperationBody;
