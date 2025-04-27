"use client";

import React, { Key, useEffect, useState } from "react";

import { Button } from "@heroui/button";

import {
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";

import { Chip } from "@heroui/chip";

import { FaChevronDown, FaPlus } from "react-icons/fa";
import useSWR from "swr";
import usePathnameClient from "@/libs/hooks/usePathnameClient";
import { fetchSds, useAppSelector } from "@/libs/constants/AppFunctions";
import SAvatar from "@/components/SAvatar";
import TimeAgoWrapper from "@/components/wrappers/TimeAgoWrapper";
import { BiDotsVerticalRounded } from "react-icons/bi";
import TransferModal from "@/components/TransferModal";
import LoadingCard from "@/components/LoadingCard";
import { useLogin } from "@/components/auth/AuthProvider";
import { vestToSteem } from "@/libs/helper/vesting";
import moment from "moment";
import { capitalize } from "@/libs/constants/AppConstants";
import { useSession } from "next-auth/react";
import SLink from "@/components/SLink";
import TableWrapper from "@/components/wrappers/TableWrapper";

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
  const { data: session } = useSession();

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
  const isSelf = session?.user?.name === username;
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
  const [statusFilter, setStatusFilter] = React.useState<any>("all");
  const hasSearchFilter = Boolean(filterValue);

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

  const renderCell = React.useCallback(
    (delegation: Delegation, columnKey) => {
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
                  disabledKeys={
                    !(canEdit || canRemove) ? ["edit", "remove"] : []
                  }
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
                <SLink className=" hover:text-blue-500" href={`/@${username}`}>
                  {username}
                </SLink>
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
    },
    [globalData, loginInfo]
  );

  if (isPending) return <LoadingCard />;

  return (
    <>
      <TableWrapper
        initialVisibleColumns={INITIAL_VISIBLE_COLUMNS}
        tableColumns={columns}
        filterValue={filterValue}
        filteredItems={filteredItems}
        onFilterValueChange={setFilterValue}
        renderCell={renderCell}
        sortDescriptor={{ column: "vests", direction: "descending" }}
        headerColumnTitle="Status"
        topContentDropdown={
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
              onSelectionChange={(e) => {
                setStatusFilter(e);
              }}
            >
              {statusOptions.map((status) => (
                <DropdownItem key={status.uid} className="capitalize">
                  {capitalize(status.name)}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        }
        topContentEnd={
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
        }
      />
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
    </>
  );
}
