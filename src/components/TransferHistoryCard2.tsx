import { Badge } from "@heroui/badge";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import React from "react";

interface TransactionHistoryCardProps {
  op: AccountHistory;
  context: string;
  steem_per_share: number;
}

export const TransactionHistoryCard2: React.FC<TransactionHistoryCardProps> = ({
  op,
}) => {
  const [operationType, operationData] = op.op;

  const getOperationDisplay = () => {
    switch (operationType) {
      case "transfer":
        return {
          type: "Transfer",
          description: `${operationData.from} → ${operationData.to}: ${operationData.amount}`,
          color: "success" as const,
        };
      case "author_reward":
        return {
          type: "Author Reward",
          description: `Earned: ${operationData.sbd_payout} SBD, ${operationData.steem_payout} STEEM`,
          color: "secondary" as const,
        };
      case "curation_reward":
        return {
          type: "Curation Reward",
          description: `${operationData.reward} for @${operationData.author}/${operationData.permlink}`,
          color: "secondary" as const,
        };
      case "transfer_to_vesting":
        return {
          type: "Power Up",
          description: `${operationData.from} → ${operationData.to}: ${operationData.amount}`,
          color: "primary" as const,
        };
      case "claim_reward_balance":
        return {
          type: "Claim Rewards",
          description: `${operationData.reward_steem} ${operationData.reward_sbd} ${operationData.reward_vests}`,
          color: "secondary" as const,
        };
      default:
        return {
          type: operationType.replace(/_/g, " ").toUpperCase(),
          description: JSON.stringify(operationData).substring(0, 100) + "...",
          color: "primary" as const,
        };
    }
  };

  const operation = getOperationDisplay();

  return (
    <Card className="p-3 bg-transparent shadow-none">
      <CardBody className="p-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Chip
                variant="flat"
                color={operation.color}
                className="text-xs"
              >
                {operation.type}
              </Chip>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {operation.description}
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
