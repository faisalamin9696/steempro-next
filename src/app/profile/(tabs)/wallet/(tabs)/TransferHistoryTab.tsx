"use client";

import React, { useEffect, useState } from "react";

import { Button } from "@heroui/button";
import {
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { FaChevronDown } from "react-icons/fa";
import useSWR from "swr";
import usePathnameClient from "@/libs/utils/usePathnameClient";
import { fetchSds, useAppSelector } from "@/libs/constants/AppFunctions";
import TimeAgoWrapper from "@/components/wrappers/TimeAgoWrapper";
import LoadingCard from "@/components/LoadingCard";
import moment from "moment";
import { TransferHistoryCard } from "@/components/TransferHistoryCard";
import { capitalize } from "@/libs/constants/AppConstants";
import TableWrapper from "@/components/wrappers/TableWrapper";

const INITIAL_VISIBLE_COLUMNS = ["op", "time"];

const columns = [
  { name: "OPERATION", uid: "op", sortable: false },
  { name: "TIME", uid: "time", sortable: true },
];

const statusOptions = [
  { name: "Normal Transfer", uid: "transfer" },
  { name: "Transfer to Vestings", uid: "transfer_to_vesting" },
  { name: "Author Reward", uid: "author_reward" },
  { name: "curation Reward", uid: "curation_reward" },
  { name: "Claim Reward", uid: "claim_reward_balance" },
];

const start_date = moment().subtract(30, "days").unix();
const end_date = moment().unix();

export default function TransferHistoryTab({ data }: { data: AccountExt }) {
  const { username } = usePathnameClient();

  const filters = `author_reward,curation_reward,withdraw_vesting,cancel_transfer_from_savings,claim_reward_balance,fill_convert_request,
fill_order,fill_transfer_from_savings,fill_vesting_withdraw,transfer,transfer_from_savings,transfer_to_savings,transfer_to_vesting`;

  const URL = `/account_history_api/getHistoryByOpTypesTime/${data.name}/${filters}/${start_date}-${end_date}`;
  const { data: historyData, isLoading: isLoading } = useSWR(
    URL,
    fetchSds<AccountHistory[]>
  );
  const globalData = useAppSelector((state) => state.steemGlobalsReducer.value);
  const [allRows, setAllRows] = useState<AccountHistory[]>([]);
  const [filterValue, setFilterValue] = React.useState<any>("");
  const [statusFilter, setStatusFilter] = React.useState<any>("all");
  const filteredItems = React.useMemo(() => {
    let filteredHistory = [...allRows];

    filteredHistory = filteredHistory.filter((history) =>
      JSON.stringify(history.op)
        .toLowerCase()
        .includes(filterValue.toLowerCase())
    );

    if (
      statusFilter !== "all" &&
      Array.from(statusFilter)?.length !== statusOptions.length
    ) {
      filteredHistory = filteredHistory.filter((history) =>
        Array.from(statusFilter).includes(history.op[0])
      );
    }

    return filteredHistory;
  }, [allRows, filterValue, statusFilter]);

  const renderCell = React.useCallback(
    (history: AccountHistory, columnKey) => {
      const cellValue = history[columnKey];
      switch (columnKey) {
        case "op":
          return (
            <TransferHistoryCard
              key={history.id}
              op={history}
              context={username}
              steem_per_share={globalData.steem_per_share}
            />
          );

        case "time":
          return (
            <div className="flex flex-col">
              <TimeAgoWrapper
                className="text-bold text-tiny text-default-600"
                created={history.time * 1000}
              />
            </div>
          );
        default:
          return cellValue;
      }
    },
    [globalData]
  );

  useEffect(() => {
    if (historyData) {
      historyData.reverse();
      setAllRows(historyData);
    }
  }, [historyData]);

  if (isLoading) return <LoadingCard />;

  return (
    <TableWrapper
      initialVisibleColumns={INITIAL_VISIBLE_COLUMNS}
      tableColumns={columns}
      filteredItems={filteredItems}
      onFilterValueChange={setFilterValue}
      renderCell={renderCell}
      sortDescriptor={{ column: "time", direction: "descending" }}
      topContentDropdown={
        <Dropdown>
          <DropdownTrigger className="hidden sm:flex">
            <Button
              size="sm"
              endContent={<FaChevronDown className="text-small" />}
              variant="flat"
            >
              FILTER
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
      }
    />
  );
}
