import { useAppSelector } from "@/constants/AppFunctions";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { getWitnessVotes } from "@/libs/steem/sds";
import SAvatar from "./ui/SAvatar";
import SLink from "./ui/SLink";
import { vestToSteem } from "@/utils/helper/vesting";
import LoadingCard from "./LoadingCard";
import TableWrapper from "./wrappers/TableWrapper";
import { simpleVotesToSp } from "./ProposalItemCard";
import { twMerge } from "tailwind-merge";
import { abbreviateNumber } from "@/utils/helper";
import Link from "next/link";
import SModal from "./ui/SModal";

interface Props {
  witness: { name: string; received_votes: number; votes: string };
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const INITIAL_VISIBLE_COLUMNS = ["account", "sp_own", "proxied_sp", "share"];

const columns = [
  { name: "VOTER", uid: "account", sortable: true },
  { name: "OWN (MV)", uid: "sp_own", sortable: true },
  { name: "PROXIED (MV)", uid: "proxied_sp", sortable: true },
  { name: "SHARE", uid: "share", sortable: true },
];

interface WitnessVoteProps {
  proxied_sp: number;
  share: number;
  account: string;
  sp_own: number;
}
export default function WitnessVotersModal(props: Props) {
  let { witness, isOpen, onOpenChange } = props;
  const shouldFetch = isOpen;
  const globalData = useAppSelector((state) => state.steemGlobalsReducer.value);

  const { data, isLoading } = useSWR<WitnessVoteProps[]>(
    shouldFetch ? `witness-votes-${witness.name}` : null,
    () => fetchVotersData()
  );

  const [allRows, setAllRows] = useState<WitnessVoteProps[]>([]);

  const fetchVotersData = async (): Promise<WitnessVoteProps[]> => {
    let witnessVoters = await getWitnessVotes(witness.name);

    const mappedVoters = witnessVoters.map((item) => {
      const own_sp = vestToSteem(item.vests_own, globalData.steem_per_share);
      const proxied_sp = vestToSteem(
        item.vests_proxied,
        globalData.steem_per_share
      );
      const total_sp = own_sp + proxied_sp;

      const ratio =
        (total_sp /
          simpleVotesToSp(
            witness.received_votes,
            globalData.total_vesting_shares,
            globalData.total_vesting_fund_steem
          )) *
        100;
      return {
        proxied_sp: proxied_sp,
        share: ratio,
        account: item.account,
        sp_own: own_sp,
      };
    });

    return mappedVoters;
  };

  useEffect(() => {
    if (data) setAllRows(data);
  }, [data]);

  const [filterValue, setFilterValue] = React.useState<any>("");

  const hasSearchFilter = Boolean(filterValue);

  const filteredItems = React.useMemo(() => {
    let filteredVotes = [...allRows];

    if (hasSearchFilter) {
      filteredVotes = filteredVotes.filter((votes) =>
        votes.account.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    return filteredVotes;
  }, [allRows, filterValue]);

  const renderCell = React.useCallback(
    (item: WitnessVoteProps, columnKey) => {
      const cellValue = item[columnKey];

      const ownSp = abbreviateNumber(item.sp_own);
      const proxiedSp = abbreviateNumber(item.proxied_sp);

      switch (columnKey) {
        case "account":
          return (
            <div className="flex flex-row items-start gap-1">
              <div className="flex flex-col gap-2">
                <div className="flex gap-2 items-center">
                  <SAvatar size="xs" username={item.account} />
                  <SLink
                    className=" hover:text-blue-500"
                    href={`/@${item.account}`}
                  >
                    {item.account}
                  </SLink>
                </div>
              </div>
            </div>
          );

        case "sp_own":
          return (
            <div className="flex flex-col">
              <p className={twMerge("text-bold text-small uppercase")}>
                {ownSp?.toLocaleString()}
              </p>
            </div>
          );

        case "proxied_sp":
          return (
            <div className="flex flex-col">
              <p className={twMerge("text-bold text-small uppercase")}>
                {proxiedSp?.toLocaleString()}
              </p>
            </div>
          );

        case "share":
          return (
            <div className="flex flex-col">
              <p className={twMerge("text-bold text-small capitalize")}>
                {item.share?.toLocaleString()}%
              </p>
            </div>
          );
        default:
          return cellValue;
      }
    },
    [globalData, data]
  );

  return (
    <SModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      modalProps={{ size: "xl", scrollBehavior: "inside" }}
      title={() => (
        <div className=" flex flex-row gap-2 items-center">
          <p>Voters of</p>
          <SAvatar
            size="xs"
            linkClassName="flex-row-reverse"
            content={<p className="font-normal text-sm">{witness.name}</p>}
            username={witness.name}
          />
        </div>
      )}
      body={() => (
        <>
          {isLoading ? (
            <LoadingCard />
          ) : (
            allRows && (
              <TableWrapper
                filterValue={filterValue}
                isCompact={false}
                hidePaginationActions
                initialVisibleColumns={INITIAL_VISIBLE_COLUMNS}
                tableColumns={columns}
                filteredItems={filteredItems}
                onFilterValueChange={setFilterValue}
                renderCell={renderCell}
                mobileVisibleColumns={["account", "sp_own", "share"]}
                baseVarient
                sortDescriptor={{
                  column: "share",
                  direction: "descending",
                }}
              />
            )
          )}
        </>
      )}
    />
  );
}
