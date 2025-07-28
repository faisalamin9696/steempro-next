import { getOperationIcon } from "@/libs/OperationIcons";
import OperationBody from "@/components/OperationBody";
import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import { useState } from "react";
import { FaChevronDown, FaChevronRight, FaCode } from "react-icons/fa";
import TimeAgoWrapper from "./wrappers/TimeAgoWrapper";
import SLink from "./ui/SLink";

interface OperationItemProps {
  operation: AccountHistory;
  steem_per_share: number;
}

// Helper function to format complex values for display
const formatPreviewValue = (key: string, value: any): string => {
  if (value === null || value === undefined) {
    return "N/A";
  }

  // Handle exchange_rate object specifically
  if (key === "exchange_rate" && typeof value === "object") {
    const base = value.base || "N/A";
    const quote = value.quote || "N/A";
    return `${base} / ${quote}`;
  }

  // Handle other objects
  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
};

const OperationItem = ({ operation, steem_per_share }: OperationItemProps) => {
  const { id: transactionId, time } = operation;

  const [opType, opData] = operation.op;
  const [isExpanded, setIsExpanded] = useState(false);
  useState<React.ReactNode>(null);
  const operationIcon = getOperationIcon(opType);
  // Check if this is a comment operation for post linking
  const isComment = opType === "comment";
  const isPost = isComment && !opData.parent_author;

  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200">
      {/* Operation Header - Primary Focus */}
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            {/* Operation Icon */}
            <div className="relative max-sm:hidden">
              <div className="w-10 h-10 bg-secondary/30 rounded-lg flex items-center justify-center">
                <span className="text-xl">{operationIcon}</span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              {/* Operation Type & Transaction Reference */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <h4 className="text-base font-bold capitalize text-default-900">
                    {opType.replace(/_/g, " ")}
                  </h4>
                  <TimeAgoWrapper
                    created={time * 1000}
                    className="text-default-600"
                  />

                  {/* <div className="px-2 py-1 rounded text-xs font-medium">
                    {opType}
                  </div> */}
                </div>

                {/* Transaction ID and Details */}
                <div className="flex items-center space-x-3">
                  <SLink
                    target="_blank"
                    href={`https://steemworld.org/block/${
                      operation.block_num
                    }/${
                      operation.virtual
                        ? `virtual/${operation.op_index}`
                        : `${operation.block_num}-${operation.trans_index}`
                    }`}
                    className="text-xs transition-colors font-mono flex items-center space-x-1 bg-default/50 px-2 py-1 rounded"
                  >
                    <span>#{operation.block_num}</span>
                    {/* <span>
                      {transactionId?.toString().slice(0, 8)}...
                      {transactionId?.toString().slice(-8)}
                    </span> */}
                    {/* <ExternalLink className="w-3 h-3" /> */}
                  </SLink>
                </div>
              </div>

              {/* Formatted Description */}

              <div className=" py-2 text-default-600">
                <OperationBody
                  operation={operation.op}
                  steem_per_share={steem_per_share}
                />
              </div>

              {/* Key operation details preview */}
              {opData && typeof opData === "object" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(opData)
                    .filter(([_, value]) => {
                      if (typeof value === "string") {
                        return (
                          !value.startsWith("0") &&
                          value !== "0.000 STEEM" &&
                          value !== "0.000 SBD"
                        );
                      }
                      return true; // Include if not string (just in case)
                    })
                    .slice(0, 2)
                    .map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground capitalize min-w-0 flex-shrink-0">
                          {key.replace(/_/g, " ")}:
                        </span>
                        <div className="text-sm font-mono bg-secondary/30 px-2 py-1 rounded text-foreground min-w-0 flex-1">
                          <span className="truncate block">
                            {formatPreviewValue(key, value)}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onPress={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-1 ml-4 text-default-600"
          >
            <FaCode size={18} className="max-sm:hidden" />
            {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
          </Button>
        </div>

      {/* Raw Operation Data - Expandable */}
      {isExpanded && (
        <div className="px-4 mt-4 pb-4 bg-secondary/20 rounded border-t-1 border-default-700/30">
          <div className="space-y-4 pt-4">
            <div className="flex items-center space-x-2 text-sm font-medium text-foreground">
              <FaCode className="w-4 h-4" />
              <span>Raw Operation Data</span>
            </div>

            <pre className="bg-background/80 p-4 rounded-lg text-xs font-mono break-words whitespace-pre-wrap border border-border/30 max-h-64 overflow-y-auto">
              {JSON.stringify(opData, null, 2)}
            </pre>
            {/* Full operation details grid */}
            {opData &&
              typeof opData === "object" &&
              Object.keys(opData).length > 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-border/30">
                  {Object.entries(opData).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <div className="text-xs text-muted-foreground capitalize font-medium">
                        {key.replace(/_/g, " ")}
                      </div>
                      <div className="text-sm font-mono bg-background/60 p-2 rounded border border-border/30">
                        <span className="break-all">
                          {formatPreviewValue(key, value)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default OperationItem;
