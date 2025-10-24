"use client";

import React, { useEffect, useState } from "react";

import { Button } from "@heroui/button";
import {
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import useSWR from "swr";
import { fetchSds, useAppSelector } from "@/constants/AppFunctions";
import LoadingCard from "@/components/LoadingCard";
import moment from "moment";
import { capitalize } from "@/constants/AppConstants";
import { useParams } from "next/navigation";
import OperationItem from "@/components/OperationItem";
import { IoFilterOutline } from "react-icons/io5";
import STable from "@/components/ui/STable";

const statusOptions = [
  { name: "Normal Transfer", uid: "transfer" },
  { name: "Transfer to Vestings", uid: "transfer_to_vesting" },
  { name: "Author Reward", uid: "author_reward" },
  { name: "curation Reward", uid: "curation_reward" },
  { name: "Claim Reward", uid: "claim_reward_balance" },
  // { name: "Producer Reward", uid: "producer_reward" },
  // { name: "Price Feed", uid: "feed_publish" },
];

const start_date = moment().subtract(30, "days").unix();
const end_date = moment().unix();

export default function TransferHistoryTab({ data }: { data: AccountExt }) {
  let { username } = useParams() as { username: string };
  username = username?.toLowerCase();

  const filters = `author_reward,curation_reward,withdraw_vesting,cancel_transfer_from_savings,claim_reward_balance,fill_convert_request,
fill_order,fill_transfer_from_savings,fill_vesting_withdraw,transfer,transfer_from_savings,transfer_to_savings,transfer_to_vesting`;

  const URL = data.name
    ? `/account_history_api/getHistoryByOpTypesTime/${data.name}/${filters}/${start_date}-${end_date}`
    : null;
  const { data: historyData, isLoading: isLoading } = useSWR(
    URL,
    fetchSds<AccountHistory[]>
  );
  const globalData = useAppSelector((state) => state.steemGlobalsReducer.value);
  const [allRows, setAllRows] = useState<AccountHistory[]>([]);
  const [statusFilter, setStatusFilter] = React.useState<any>("all");

  const filteredItems = React.useMemo(() => {
    let filteredHistory = [...allRows];

    if (
      statusFilter !== "all" &&
      Array.from(statusFilter)?.length !== statusOptions.length
    ) {
      filteredHistory = filteredHistory.filter((history) =>
        Array.from(statusFilter).includes(history.op[0])
      );
    }

    return filteredHistory;
  }, [allRows, statusFilter]);

  useEffect(() => {
    if (historyData) {
      const sortedData = historyData.reverse();
      setAllRows(sortedData);
    }
  }, [historyData, username]);

  if (isLoading) return <LoadingCard />;

  return (
    <STable
      itemsPerPage={30}
      filterByValue={["op.[1].['from']", "op.[1].['to']", "op.[1].['memo']"]}
      titleClassName="w-full"
      title={
        <div className="flex flex-row items-center justify-between w-full">
          <p>Transaction History</p>

          <Dropdown>
            <DropdownTrigger>
              <Button
                size="sm"
                variant="flat"
                startContent={<IoFilterOutline size={18} />}
                className="font-semibold text-small"
              >
                Filter
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label="Table Columns"
              closeOnSelect={false}
              selectedKeys={statusFilter}
              selectionMode="multiple"
              onSelectionChange={setStatusFilter}
            >
              {statusOptions.map((status) => (
                <DropdownItem key={status.uid} className="capitalize">
                  {capitalize(status.name)}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>
      }
      description="View your transaction history, including transfers, rewards, and more."
      bodyClassName="flex flex-col gap-6"
      data={filteredItems}
      tableRow={(operation: AccountHistory) => {
        return (
          <OperationItem
            steem_per_share={globalData.steem_per_share}
            operation={operation}
          />
        );
      }}
    />
  );
}
