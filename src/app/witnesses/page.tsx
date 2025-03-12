"use client";

import SAvatar from "@/components/SAvatar";
import TimeAgoWrapper from "@/components/wrappers/TimeAgoWrapper";
import { fetchSds, useAppSelector } from "@/libs/constants/AppFunctions";
import { abbreviateNumber, formatNumberInMillions } from "@/libs/utils/helper";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import LoadingCard from "@/components/LoadingCard";
import { RiLinkM } from "react-icons/ri";
import { replaceOldDomains } from "@/libs/utils/Links";
import WitnessVoteButton from "@/components/WitnessVoteButton";
import { validate_account_name } from "@/libs/utils/ChainValidation";
import SLink from "@/components/SLink";
import TableWrapper from "@/components/wrappers/TableWrapper";
import WitnessVotersModal from "@/components/WitnessVotersModal";
import { useDisclosure } from "@heroui/react";
import { simpleVotesToSp } from "@/components/ProposalItemCard";
import { twMerge } from "tailwind-merge";

const INITIAL_VISIBLE_COLUMNS = [
  "rank",
  "name",
  "received_votes",
  "price",
  "action",
];

const columns = [
  { name: "RANK", uid: "rank", sortable: true },
  { name: "WITNESS", uid: "name", sortable: true },
  { name: "VOTES (SP)", uid: "received_votes", sortable: false },
  { name: "VERSION", uid: "running_version", sortable: false },
  { name: "BLOCK", uid: "last_confirmed_block", sortable: false },
  { name: "MISS", uid: "missed_blocks", sortable: true },
  { name: "PRICE FEED", uid: "price", sortable: false },
  { name: "VOTE", uid: "action", sortable: false },
];

const disable_key = "STM1111111111111111111111111111111114T1Anm";

export default function page() {
  const URL = `/witnesses_api/getWitnessesByRank`;
  const { data, isLoading } = useSWR(URL, fetchSds<Witness[]>);
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const [allRows, setAllRows] = useState<Witness[]>([]);
  const globalData = useAppSelector((state) => state.steemGlobalsReducer.value);

  const [witnessModal, setWitnessModal] = useState<{
    isOpen: boolean;
    witness?: Witness;
  }>({
    isOpen: false,
  });

  useEffect(() => {
    if (data) {
      const hashRef = window.location.hash.replace("#", "");
      const witnessRef = !validate_account_name(hashRef) ? hashRef : "";

      if (witnessRef) {
        const index = data?.findIndex((account) => account.name === witnessRef);
        if (index && index !== -1) {
          const targetWitness = data?.splice(index, 1)[0];
          if (targetWitness) data?.unshift(targetWitness);
        }
      }
      setAllRows(data);
    }
  }, [data]);

  const [filterValue, setFilterValue] = React.useState<any>("");

  const filteredItems = React.useMemo(() => {
    let filteredDelegations = [...allRows];

    filteredDelegations = filteredDelegations.filter((delegation) =>
      delegation.name.toLowerCase().includes(filterValue.toLowerCase())
    );

    return filteredDelegations;
  }, [allRows, filterValue]);

  const renderCell = React.useCallback((witness: Witness, columnKey) => {
    const cellValue = witness[columnKey];

    const votesStr =
      simpleVotesToSp(
        witness.received_votes,
        globalData.total_vesting_shares,
        globalData.total_vesting_fund_steem
      )?.toLocaleString() + " SP";

    switch (columnKey) {
      case "name":
        return (
          <div className="flex flex-row items-center">
            <div className="flex gap-2 items-center">
              <SAvatar size="xs" username={witness.name} />
              <SLink
                className={twMerge(
                  " hover:text-blue-500",
                  witness.signing_key === disable_key && "line-through text-warning-500"
                )}
                href={`/@${witness.name}`}
              >
                {witness.name}
              </SLink>
              <SLink target="_blank" href={replaceOldDomains(witness.url)}>
                <RiLinkM className="text-lg" />
              </SLink>
            </div>
          </div>
        );
      case "received_votes":
        return (
          <div
            className="text-bold text-small cursor-pointer text-blue-500 font-semibold"
            onClick={() => {
              setWitnessModal({ isOpen: true, witness: witness });
            }}
          >
            <p>{votesStr}</p>
          </div>
        );

      case "last_confirmed_block":
        return (
          <div className="flex flex-col gap-1 text-bold text-small">
            <p>{witness.last_confirmed_block}</p>
            <TimeAgoWrapper
              className="text-bold text-tiny text-default-600"
              created={witness.last_sync * 1000}
            />
          </div>
        );
      case "missed_blocks":
        return (
          <div className="flex gap-1 text-bold text-small">
            <p>{abbreviateNumber(witness.missed_blocks, 2)}</p>
          </div>
        );

      case "action":
        return <WitnessVoteButton witness={witness} />;

      case "price":
        return (
          <div className="flex flex-col gap-1 text-bold text-small">
            <p>{witness.reported_price.base}</p>
            <TimeAgoWrapper
              className="text-bold text-tiny text-default-600"
              created={witness.last_price_report * 1000}
            />
          </div>
        );

      default:
        return cellValue;
    }
  }, []);

  return (
    <div className="flex flex-col gap-4 overflow-hidden p-2">
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-blue-500 text-3xl font-semibold">
          Steem Witnesses (aka "Block Producers")
        </p>
        <p className="text-xs opacity-disabled">
          {`You have ${
            30 - (loginInfo?.witness_votes?.length || 0)
          } votes remaining. You can vote for a maximum of 30 witnesses.`}
        </p>
      </div>

      <TableWrapper
        isLoading={isLoading}
        tableColumns={columns}
        initialVisibleColumns={INITIAL_VISIBLE_COLUMNS}
        filterValue={filterValue}
        onFilterValueChange={setFilterValue}
        filteredItems={filteredItems}
        renderCell={renderCell}
        mobileVisibleColumns={["rank", "name"]}
        sortDescriptor={{ column: "rank", direction: "ascending" }}
      />

      {witnessModal.isOpen && witnessModal.witness && (
        <WitnessVotersModal
          witness={witnessModal.witness}
          isOpen={witnessModal.isOpen}
          onOpenChange={() => setWitnessModal({ isOpen: false })}
        />
      )}
    </div>
  );
}
