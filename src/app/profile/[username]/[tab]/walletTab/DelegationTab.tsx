"use client";

import React, { Key, useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { useTranslation } from "@/utils/i18n";
import { Chip } from "@heroui/chip";
import { FaPlus } from "react-icons/fa";
import useSWR from "swr";
import { fetchSds, useAppSelector } from "@/constants/AppFunctions";
import SAvatar from "@/components/ui/SAvatar";
import TimeAgoWrapper from "@/components/wrappers/TimeAgoWrapper";
import TransferModal from "@/components/TransferModal";
import LoadingCard from "@/components/LoadingCard";
import { useLogin } from "@/components/auth/AuthProvider";
import { vestToSteem } from "@/utils/helper/vesting";
import moment from "moment";
import { useSession } from "next-auth/react";
import SLink from "@/components/ui/SLink";
import { useParams } from "next/navigation";
import STable from "@/components/ui/STable";
import { sortByKey } from "@/utils/helper";
import { capitalize } from "@/constants/AppConstants";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { IoFilterOutline, IoSwapHorizontal } from "react-icons/io5";
import { MdDelete, MdEditSquare } from "react-icons/md";
import { SlOptions } from "react-icons/sl";
import { RiArrowLeftDownLine, RiArrowRightUpLine } from "react-icons/ri";

const getSortOptions = (t: (key: string) => string) => [
  { name: t("wallet.low_to_high"), uid: "asc" },
  { name: t("wallet.high_to_low"), uid: "desc" },
];

const statusColorMap = {
  incoming: "success",
  expiring: "danger",
  outgoing: "warning",
};

export default function DelegationTab({ data }: { data: AccountExt }) {
  const { t } = useTranslation();
  const sortOptions = getSortOptions(t);
  let { username } = useParams() as { username: string };
  username = username?.toLowerCase();
  const URL_OUTGOING = `/delegations_api/getOutgoingDelegations/${username}`;
  const URL_INCOMING = `/delegations_api/getIncomingDelegations/${username}`;
  const URL_EXPIRING = `/delegations_api/getExpiringDelegations/${username}`;
  const { data: session } = useSession();
  const [sortBY, setSortBy] = React.useState<"asc" | "desc">("desc");

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

  const [statusFilter, setStatusFilter] = React.useState<
    ("all" | "incoming" | "outgoing" | "expiring")[]
  >(["all"]);

  const filteredItems = React.useMemo(() => {
    const sortedItems = sortByKey(allRows, "vests", sortBY);

    let filteredDelegations = [...sortedItems];

    if (!statusFilter.includes("all")) {
      filteredDelegations = filteredDelegations.filter((delegation) =>
        Array.from(statusFilter).includes(delegation.status?.toLowerCase())
      );
    }

    return filteredDelegations;
  }, [allRows, statusFilter, sortBY]);

  if (isPending) return <LoadingCard />;

  const totalExpiring = allRows
    .filter((d) => d.status === "expiring")
    .reduce((sum, d) => sum + d.vests, 0);

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

  return (
    <>
      <STable
        itemsPerPage={30}
        bodyClassName="grid grid-cols-1 md:grid-cols-2 gap-8"
        data={filteredItems}
        description={t("wallet.delegation_description")}
        titleClassName="w-full"
        filterByValue={["from", "to"]}
        searchEndContent={
          <Dropdown>
            <DropdownTrigger>
              <Button
                size="sm"
                variant="flat"
                startContent={<IoFilterOutline size={18} />}
                className="font-semibold text-xs sm:text-sm"
              >
                {sortOptions?.find((s) => s.uid === sortBY)?.name}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label="Table Columns"
              closeOnSelect={true}
              selectedKeys={[sortBY]}
              selectionMode="single"
              onSelectionChange={(item) =>
                setSortBy(item.currentKey?.toString() as any)
              }
            >
              {sortOptions.map((status) => (
                <DropdownItem key={status.uid} className="capitalize">
                  {capitalize(status.name)}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        }
        title={
          <div className="flex flex-row justify-between items-center w-full gap-2">
            <p>{t("wallet.total_delegation")}</p>

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
              {t("wallet.new_delegation")}
            </Button>
          </div>
        }
        titleExtra={
          <div className="flex flex-wrap gap-2">
            {!!data.vests_in && (
              <Chip
                size="sm"
                variant="flat"
                color="success"
                classNames={{
                  closeButton: "ms-1 text-xl",
                }}
                onClick={() => {
                  setStatusFilter(["incoming"]);
                }}
                onClose={
                  !statusFilter.includes("incoming")
                    ? undefined
                    : () => setStatusFilter(["all"])
                }
                className="text-sm cursor-pointer hover:bg-success-100 transition-colors"
              >
                <div className="flex flex-row gap-2 items-center">
                  <RiArrowLeftDownLine size={16} />
                  {vestToSteem(
                    data.vests_in,
                    globalData.steem_per_share
                  )?.toLocaleString() + " SP"}
                </div>
              </Chip>
            )}
            {!!data.vests_out && (
              <Chip
                classNames={{
                  closeButton: "ms-1 text-xl",
                }}
                size="sm"
                variant="flat"
                color="warning"
                className="text-sm cursor-pointer hover:bg-warning-100 transition-colors"
                onClick={() => {
                  setStatusFilter(["outgoing"]);
                }}
                onClose={
                  !statusFilter.includes("outgoing")
                    ? undefined
                    : () => setStatusFilter(["all"])
                }
              >
                <div className="flex flex-row gap-2 items-center">
                  <RiArrowRightUpLine size={16} />

                  {vestToSteem(
                    data.vests_out,
                    globalData.steem_per_share
                  )?.toLocaleString() + " SP"}
                </div>
              </Chip>
            )}

            {!!totalExpiring && (
              <Chip
                classNames={{
                  closeButton: "ms-1 text-xl",
                }}
                size="sm"
                variant="flat"
                color="danger"
                className="text-sm cursor-pointer hover:bg-danger-100 transition-colors"
                onClick={() => {
                  setStatusFilter(["expiring"]);
                }}
                onClose={
                  !statusFilter.includes("expiring")
                    ? undefined
                    : () => setStatusFilter(["all"])
                }
              >
                <div className="flex flex-row gap-2 items-center">
                  <IoSwapHorizontal size={16} />
                  {vestToSteem(
                    totalExpiring,
                    globalData.steem_per_share
                  )?.toLocaleString() + " SP"}
                </div>
              </Chip>
            )}
          </div>
        }
        tableRow={(delegation: Delegation) => {
          const canEdit =
            delegation["status"] === "outgoing" &&
            delegation.from === loginInfo.name;

          const username =
            delegation.status === "incoming" ? delegation.from : delegation.to;

          return (
            <div className="flex gap-2 items-center">
              <SAvatar size="1xs" username={username} />

              <div className="flex flex-row items-center justify-between w-full gap-2">
                <div className=" flex flex-col gap-2">
                  <div className="flex flex-row gap-2">
                    <SLink
                      className=" hover:text-blue-500"
                      href={`/@${username}`}
                    >
                      {username}
                    </SLink>

                    <Chip
                      className="capitalize border-none gap-1 text-default-600"
                      color={statusColorMap[delegation["status"]]}
                      size="sm"
                      variant="flat"
                    >
                      {t(`wallet.${delegation.status}`)}
                    </Chip>

                    {canEdit && (
                      <Dropdown>
                        <DropdownTrigger>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            radius="full"
                          >
                            <SlOptions size={16} />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                          variant="flat"
                          onAction={(keys) =>
                            handleMenuActions(keys, delegation)
                          }
                        >
                          <DropdownItem key={`edit`}>
                            <div className="flex flex-row items-center gap-2">
                              <MdEditSquare size={16} /> {t("wallet.edit")}
                            </div>
                          </DropdownItem>
                          <DropdownItem
                            variant="flat"
                            key={`remove`}
                            color="danger"
                            className="text-danger"
                          >
                            <div className="flex flex-row items-center gap-2">
                              <MdDelete size={16} />
                              {t("wallet.remove")}
                            </div>
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    )}
                  </div>

                  <div className="flex flex-row gap-2">
                    <TimeAgoWrapper
                      className="text-bold text-tiny text-default-500"
                      created={
                        (delegation.status === "expiring"
                          ? delegation?.expiration ?? 0
                          : delegation.time) * 1000
                      }
                    />
                    •
                    <p className="text-bold text-xs capitalize">
                      {vestToSteem(
                        delegation.vests,
                        globalData.steem_per_share
                      )?.toLocaleString()}{" "}
                      SP
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        }}
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
