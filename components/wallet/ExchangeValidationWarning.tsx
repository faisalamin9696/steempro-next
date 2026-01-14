import { Alert } from "@heroui/react";
import React from "react";

interface ExchangeValidationWarningProps {
  warningType: "verified" | "suspicious" | "validation";
  similarityPercentage?: number;
  similarAccountName?: string | null;
  currency?: string;
}

export const ExchangeValidationWarning: React.FC<
  ExchangeValidationWarningProps
> = ({
  warningType,
  similarityPercentage = 0,
  similarAccountName = "",
  currency = "",
}) => {
  const WarningMessages = {
    verified: (
      <Alert
        color="danger"
        variant="faded"
        classNames={{ title: "font-semibold pb-2" }}
        title="Exchange Account Detected"
        description={
          <ul className="text-sm list-disc list-inside space-y-0.5">
            <li>Use correct exchange memo & address</li>
            <li>Confirm deposits are not suspended</li>
            <li>Verify {currency} is supported</li>
          </ul>
        }
      />
    ),
    suspicious: (
      <Alert
        color="warning"
        variant="faded"
        classNames={{ title: "font-semibold pb-2" }}
        title="Similar Exchange Account"
        description={
          <p className="text-sm">
            <strong>{similarityPercentage}% similar</strong> to @
            <button>{similarAccountName}</button>. Verify address to avoid permanent fund loss.
          </p>
        }
      />
    ),
    validation: (
      <Alert
        color="danger"
        variant="faded"
        classNames={{ title: "font-semibold pb-2" }}
        title="Likely Scam Address"
        description="Intentional misspelling of exchange account. Do not transfer funds."
      />
    ),
  };

  return WarningMessages[warningType];
};
