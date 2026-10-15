"use client";

import { sdsApi } from "@/libs/sds";
import { Alert } from "@heroui/alert";
import { RefreshCw } from "lucide-react";
import moment from "moment";
import useSWR from "swr";

interface ConversionStatusProps {
  account: AccountExt;
}

export const ConversionStatus = ({ account }: ConversionStatusProps) => {
  const { data: conversions } = useSWR(
    account ? `conversion_requests/${account.name}` : null,
    () => sdsApi.getPendingConversions(account.name)
  );

  if (!conversions || conversions.length === 0) {
    return null;
  }

  // Calculate total SBD being converted
  const totalAmount = conversions.reduce((sum: number, req: any) => {
    return sum + parseFloat(req.amount.split(" ")[0]);
  }, 0);

  return (
    <Alert
      color="warning"
      variant="faded"
      title="SBD Conversions Active"
      icon={
        <div>
          <RefreshCw />
        </div>
      }
      classNames={{
        title: "font-semibold pb-2",
      }}
      hideIconWrapper
      description={
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1.5 justify-between text-sm">
            <span className="text-muted">Total Converting</span>
            <span className="font-semibold">
              {totalAmount.toLocaleString()} SBD
            </span>
          </div>

          <div className="flex flex-col gap-1 pt-1 border-t border-default-200/50">
            {conversions.map((req: any, i: number) => (
              <div
                key={req.requestid}
                className="flex justify-between items-center text-xs"
              >
                <span className="text-default-600 font-medium">
                  {req.amount}
                </span>
                <span
                  title={moment(req.conversion_date).format(
                    "MMM DD, YYYY hh:mm A"
                  )}
                  className="text-muted"
                >
                  {moment(req.conversion_date).fromNow()}
                </span>
              </div>
            ))}
          </div>
        </div>
      }
    />
  );
};
