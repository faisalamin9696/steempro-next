"use client";

import React, { useEffect, useState } from "react";

import { Button } from "@heroui/button";
import {
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { FaChevronDown, FaFilter } from "react-icons/fa";
import useSWR from "swr";
import { fetchSds, useAppSelector } from "@/constants/AppFunctions";
import LoadingCard from "@/components/LoadingCard";
import moment from "moment";
import { capitalize } from "@/constants/AppConstants";
import TableWrapper from "@/components/wrappers/TableWrapper";
import { useParams } from "next/navigation";
import OperationItem from "@/components/OperationItem";
import { BiFilter } from "react-icons/bi";
import { BsFilterCircle } from "react-icons/bs";
import { IoFilterOutline } from "react-icons/io5";

const INITIAL_VISIBLE_COLUMNS = ["op"];

const columns = [{ name: "", uid: "op", sortable: false }];

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
  const [filterValue, setFilterValue] = React.useState<any>("");
  const hasSearchFilter = Boolean(filterValue);
  const [statusFilter, setStatusFilter] = React.useState<any>("all");
  const filteredItems = React.useMemo(() => {
    let filteredHistory = [...allRows];
    if (hasSearchFilter) {
      filteredHistory = filteredHistory.filter((history) =>
        JSON.stringify(history.op)
          .toLowerCase()
          .includes(filterValue.toLowerCase())
      );
    }

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
    (operation: AccountHistory, columnKey) => {
      const cellValue = operation[columnKey];
      switch (columnKey) {
        case "op":
          return (
            <OperationItem
              steem_per_share={globalData.steem_per_share}
              operation={operation}
            />
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
      filterValue={filterValue}
      isStriped={false}
      classNames={{ th: "!h-0 !bg-transparent" }}
      onFilterValueChange={setFilterValue}
      renderCell={renderCell}
      sortDescriptor={{ column: "time", direction: "descending" }}
      searchPlaceHolder="Search transcations..."
      topContentDropdown={
        <Dropdown>
          <DropdownTrigger className="hidden sm:flex">
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
      }
    />
  );
}
