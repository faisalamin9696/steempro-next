import React from "react";
import SUsername from "../ui/SUsername";
import PostLink from "../post/PostLink";
import {
  extractVestsAmount,
  formatAmount,
  formatAmountFromObject,
} from "@/utils/formatters";
import { useSteemUtils } from "@/hooks/useSteemUtils";

type Operation = [string, any];

function OperationBody({ operation }: { operation: Operation }) {
  const [opType, opData] = operation;
  const { vestsToSteem } = useSteemUtils();

  try {
    const userLink = (username: string) => (
      <div className="flex flex-row gap-1 items-center">
        {/* <SAvatar username={username} size="xs" /> */}
        <SUsername username={`@${username}`} className="font-semibold" />
      </div>
    );

    const postLink = (
      author: string,
      permlink: string,
      children?: React.ReactNode
    ) => (
      <PostLink
        href={`/@${author}/${permlink}`}
        title={children ?? `@${author}/${permlink}`}
      />
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
            Powered up {formatAmount(opData.amount)} to {userLink(recipient)}
          </>
        );

      case "withdraw_vesting": {
        const isStop = parseFloat(opData.vesting_shares) === 0;
        const powerdownVests = extractVestsAmount(opData.vesting_shares);
        const powerdownSP = vestsToSteem(powerdownVests);

        if (isStop)
          return wrap(<>Stopped power down</>);
        else
          return wrap(
            <>
              {userLink(opData.account)} started power down of{" "}
              {formatAmount(powerdownSP)} {"SP"}
            </>
          );
      }

      case "fill_vesting_withdraw":
        return wrap(
          <>
            Fill powerdown withdraw <p>{opData.deposited}</p>
          </>
        );

      case "claim_reward_balance":
        const rewardVests = extractVestsAmount(opData.reward_vests);
        const rewardSP = vestsToSteem(rewardVests);
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

        return wrap(<>Claimed {rewards}</>);

      default:
        return <p>Unrecognized operation: {opType}</p>;
    }
  } catch (error) {
    console.error("Error interpreting operation:", error, opType, opData);
    return (
      <p className="text-muted text-sm mb-3">
        Raw operation data available below
      </p>
    );
  }
}

export default OperationBody;
