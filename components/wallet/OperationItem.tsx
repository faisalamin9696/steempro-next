import { Button } from "@heroui/button";
import { ChevronDown, ChevronUp, Code } from "lucide-react";
import { useState } from "react";
import OperationBody from "./OperationBody";

interface OperationItemProps {
  operation: AccountHistory;
}

const OperationItem = ({ operation }: OperationItemProps) => {
  const [opType, opData] = operation.op;
  const [isExpanded, setIsExpanded] = useState(false);
  useState<React.ReactNode>(null);

  return (
    <div>
      {/* Formatted Description */}
      <div className="flex flex-col text-default-600 gap-2">
        <OperationBody operation={operation.op} />
        <Button
          variant="ghost"
          size="sm"
          onPress={() => setIsExpanded(!isExpanded)}
          className="text-default-600 h-5 min-w-0 border-1 shrink-0"
          isIconOnly
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </Button>
      </div>
      {/* Raw Operation Data - Expandable */}
      {isExpanded && (
        <div className="px-2 mt-2 pb-2 bg-default rounded-md">
          <div className="space-y-2 pt-2">
            <div className="flex items-center space-x-2 text-sm">
              <Code size={16} />
              <span>Raw Operation Data</span>
            </div>

            <pre className="bg-background/80 p-4 rounded-lg text-xs font-mono wrap-break-word whitespace-pre-wrap border border-default-900/30 max-h-64 overflow-y-auto">
              {JSON.stringify(opData, null, 2)}
            </pre>
            {/* Full operation details grid */}
            {/* {opData &&
              typeof opData === "object" &&
              Object.keys(opData).length > 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-default-900/30">
                  {Object.entries(opData).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <div className="text-xs text-default-500 capitalize font-medium">
                        {key.replace(/_/g, " ")}
                      </div>
                      <div className="text-sm font-mono bg-background/60 p-2 rounded border border-default-900/30">
                        <span className="break-all">
                          {formatPreviewValue(key, value)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )} */}
          </div>
        </div>
      )}
    </div>
  );
};

export default OperationItem;
