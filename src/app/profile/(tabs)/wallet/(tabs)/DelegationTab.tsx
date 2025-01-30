"use client";

import React, { Key, useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";

import { Pagination } from "@heroui/pagination";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";

import {
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";

import { Chip } from "@heroui/chip";

import { FaChevronDown, FaPlus } from "react-icons/fa";
import useSWR from "swr";
import usePathnameClient from "@/libs/utils/usePathnameClient";
import { fetchSds, useAppSelector } from "@/libs/constants/AppFunctions";
import SAvatar from "@/components/SAvatar";
import TimeAgoWrapper from "@/components/wrappers/TimeAgoWrapper";
import { BiDotsVerticalRounded } from "react-icons/bi";
import TransferModal from "@/components/TransferModal";
import LoadingCard from "@/components/LoadingCard";
import { useLogin } from "@/components/auth/AuthProvider";
import { vestToSteem } from "@/libs/steem/sds";
import moment from "moment";
import { capitalize } from "@/libs/constants/AppConstants";
import Link from "next/link";

const statusColorMap = {
  incoming: "success",
  expiring: "danger",
  outgoing: "warning",
};

const INITIAL_VISIBLE_COLUMNS = ["from", "vests", "status"];

const columns = [
  { name: "ACCOUNT", uid: "from", sortable: true },
  { name: "AMOUNT", uid: "vests", sortable: true },
  { name: "STATUS", uid: "status", sortable: true },
];

const statusOptions = [
  { name: "Incoming", uid: "incoming" },
  { name: "Expiring", uid: "expiring" },
  { name: "Outgoing", uid: "outgoing" },
];

export default function DelegationTab({ data }: { data: AccountExt }) {
  const { username } = usePathnameClient();
  const URL_OUTGOING = `/delegations_api/getOutgoingDelegations/${username}`;
  const URL_INCOMING = `/delegations_api/getIncomingDelegations/${username}`;
  const URL_EXPIRING = `/delegations_api/getExpiringDelegations/${username}`;

  const { data: outgoingData, isLoading: isLoading1 } = useSWR(
    URL_OUTGOING,
    fetchSds<Delegation[]>
  );
  const { data: incomingData, isLoading: isLoading2 } = useSWR(
    URL_INCOMING,
    fetchSds<Delegation[]>
  );
  const { data: expiringData, isLoading: isLoading3 } = useSWR(
    URL_EXPIRING,
    fetchSds<Delegation[]>
  );

  const isPending = isLoading1 || isLoading2 || isLoading3;

  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const globalData = useAppSelector((state) => state.steemGlobalsReducer.value);
  const isSelf = !!loginInfo.name && loginInfo.name === username;
  const { authenticateUser, isAuthorized } = useLogin();

  const [transferModal, setTransferModal] = useState<{
    isOpen: boolean;
    delegatee?: string;
    oldDelegation?: number;
    isRemove?: boolean;
    delegation?: Delegation;
  }>({ isOpen: false });

  const outgoingRows = outgoingData?.map((item) => {
    return { ...item, status: "outgoing" };
  });

  const incomingRows = incomingData?.map((item) => {
    return { ...item, status: "incoming" };
  });
  const expiringRows = expiringData?.map((item) => {
    return { ...item, status: "expiring" };
  });

  const [allRows, setAllRows] = useState<Delegation[]>([]);

  useEffect(() => {
    setAllRows([
      ...(outgoingRows ?? []),
      ...(incomingRows ?? []),
      ...(expiringRows ?? []),
    ]);
  }, [outgoingData, incomingData, expiringData]);

  const [filterValue, setFilterValue] = React.useState<any>("");
  const [visibleColumns, setVisibleColumns] = React.useState<any>(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [statusFilter, setStatusFilter] = React.useState<any>("all");
  const [rowsPerPage, setRowsPerPage] = React.useState<any>(5);
  const [sortDescriptor, setSortDescriptor] = React.useState<any>({
    column: "vests",
    direction: "descending",
  });
  const [page, setPage] = React.useState(1);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filteredDelegations = [...allRows];

    if (hasSearchFilter) {
      filteredDelegations = filteredDelegations.filter(
        (delegation) =>
          delegation.from.toLowerCase().includes(filterValue.toLowerCase()) ||
          delegation.to.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    if (
      statusFilter !== "all" &&
      Array.from(statusFilter)?.length !== statusOptions.length
    ) {
      filteredDelegations = filteredDelegations.filter((delegation) =>
        Array.from(statusFilter).includes(delegation.status)
      );
    }

    return filteredDelegations;
  }, [allRows, filterValue, statusFilter]);

  const pages = Math.ceil(filteredItems?.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = 0;
    const end = start + filteredItems.length;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  async function handleMenuActions(key: Key, delegation: Delegation) {
    switch (key) {
      case "edit":
        setTransferModal({
          isOpen: !transferModal.isOpen,
          delegatee: delegation.to,
          oldDelegation: delegation.vests,
          delegation: delegation,
        });
        break;
      case "remove":
        setTransferModal({
          isOpen: !transferModal.isOpen,
          delegatee: delegation.to,
          oldDelegation: delegation.vests,
          delegation: delegation,
          isRemove: true,
        });
        break;
    }
  }

  const renderCell = React.useCallback((delegation: Delegation, columnKey) => {
    const cellValue = delegation[columnKey];

    switch (columnKey) {
      case "from":
        const canEdit =
          delegation["status"] === "outgoing" &&
          delegation.from === loginInfo.name;
        const canRemove =
          delegation["status"] === "incoming" &&
          delegation.from === loginInfo.name;

        const username =
          delegation.status === "incoming" ? delegation.from : delegation.to;
        return (
          <div className="flex flex-row items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light" radius="full">
                  <BiDotsVerticalRounded className="text-default-600 text-xl" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disabledKeys={!(canEdit || canRemove) ? ["edit", "remove"] : []}
                onAction={(keys) => handleMenuActions(keys, delegation)}
              >
                <DropdownItem key={`edit`}>Edit</DropdownItem>
                <DropdownItem key={`remove`} color="danger">
                  Remove
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <div className="flex gap-2 items-center">
              <SAvatar size="xs" username={username} />
              <Link
                prefetch={false}
                className=" hover:text-blue-500"
                href={`/@${username}`}
              >
                {username}
              </Link>
            </div>
          </div>
        );

      case "vests":
        return (
          <div className="flex flex-col gap-2">
            <p className="text-bold text-xs capitalize">
              {vestToSteem(
                cellValue,
                globalData.steem_per_share
              )?.toLocaleString()}{" "}
              SP
            </p>
            <TimeAgoWrapper
              className="text-bold text-tiny text-default-500"
              created={
                (delegation.status === "expiring"
                  ? delegation?.expiration ?? 0
                  : delegation.time) * 1000
              }
            />
          </div>
        );
      case "status":
        return (
          <Chip
            className="capitalize border-none gap-1 text-default-600"
            color={statusColorMap[delegation["status"]]}
            size="sm"
            variant="dot"
          >
            {cellValue}
          </Chip>
        );

      default:
        return cellValue;
    }
  }, []);

  const onNextPage = React.useCallback(() => {
    if (page < pages) {
      setPage(page + 1);
    }
  }, [page, pages]);

  const onPreviousPage = React.useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const onRowsPerPageChange = React.useCallback((e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = React.useCallback((value) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("");
    setPage(1);
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            size="sm"
            isClearable
            className="w-full sm:max-w-[25%]"
            placeholder="Search..."
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  size="sm"
                  endContent={<FaChevronDown className="text-small" />}
                  variant="flat"
                >
                  Status
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

            <Button
              size="sm"
              onPress={() => {
                authenticateUser();
                if (!isAuthorized()) return;
                setTransferModal({ isOpen: !transferModal.isOpen });
              }}
              className="min-w-0"
              color="primary"
              endContent={<FaPlus />}
            >
              Add New
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {allRows?.length} delegations
          </span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="250">250</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    statusFilter,
    visibleColumns,
    onRowsPerPageChange,
    allRows.length,
    onSearchChange,
    hasSearchFilter,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      !!pages && (
        <div className="py-2 px-2 flex justify-between items-center">
          <Pagination
            isCompact
            showControls
            showShadow
            color="primary"
            page={page}
            total={pages}
            onChange={setPage}
          />
          <div className="hidden sm:flex w-[30%] justify-end gap-2">
            <Button
              isDisabled={pages === 1}
              size="sm"
              variant="flat"
              onPress={onPreviousPage}
            >
              Previous
            </Button>
            <Button
              isDisabled={pages === 1}
              size="sm"
              variant="flat"
              onPress={onNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      )
    );
  }, [items.length, page, pages, hasSearchFilter]);

  const classNames = React.useMemo(
    () => ({
      wrapper: ["max-h-[382px]", "max-w-3xl"],
      th: ["bg-transparent", "text-default-500", "border-b", "border-divider"],
      td: [
        "pl-0",
        // changing the rows border radius
        // first
        "group-data-[first=true]:first:before:rounded-none",
        "group-data-[first=true]:last:before:rounded-none",
        // middle
        "group-data-[middle=true]:before:rounded-none",
        // last
        "group-data-[last=true]:first:before:rounded-none",
        "group-data-[last=true]:last:before:rounded-none",
      ],
    }),
    []
  );

  if (isPending) return <LoadingCard />;

  return (
    <div>
      <Table
        aria-label="Delegation table"
        isHeaderSticky
        removeWrapper
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={classNames}
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSortChange={setSortDescriptor}
        isCompact
        isStriped
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          emptyContent={"No data found"}
          items={sortedItems.slice(
            (page - 1) * rowsPerPage,
            page * rowsPerPage
          )}
        >
          {(item) => (
            <TableRow key={`${item.from}-${item.to}`}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {transferModal.isOpen && (
        <TransferModal
          asset={"VESTS"}
          isOpen={transferModal.isOpen}
          delegation
          oldDelegation={transferModal.oldDelegation}
          delegatee={
            transferModal.delegatee
              ? transferModal.delegatee
              : isSelf
              ? ""
              : username
          }
          isRemove={transferModal.isRemove}
          onOpenChange={(isOpen) =>
            setTransferModal({
              isOpen: isOpen,
              delegation: transferModal.delegation,
            })
          }
          onDelegationSuccess={(vests) => {
            if (vests === 0) {
              // change the status to expiring of removing item
              setAllRows((prev) =>
                prev.map((item) => {
                  if (
                    item.from === transferModal.delegation?.from &&
                    item.to === transferModal.delegation?.to &&
                    item.status === transferModal.delegation?.status
                  )
                    return {
                      ...item,
                      status: "expiring",
                      expiration: moment().add(5, "days").unix(),
                    };
                  else return item;
                })
              );
            }

            // update the vevsts of the updating item
            else
              setAllRows((prev) =>
                prev.map((item) => {
                  if (
                    item.from === transferModal.delegation?.from &&
                    item.to === transferModal.delegation?.to &&
                    item.status === transferModal.delegation?.status
                  )
                    return { ...item, vests: vests, time: moment().unix() };
                  else return item;
                })
              );
          }}
        />
      )}
    </div>
  );
}
