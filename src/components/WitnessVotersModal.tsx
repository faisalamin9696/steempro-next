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
import { abbreviateNumber, sortByKey } from "@/utils/helper";
import SModal from "./ui/SModal";
import STable from "./ui/STable";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { capitalize } from "@/constants/AppConstants";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { IoFilterOutline } from "react-icons/io5";
import { formatVotesInMillions } from "@/hooks/useWitnesses";

interface Props {
  witness: { name: string; received_votes: number; votes: string };
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const sortOptions = [
  { name: "Share", uid: "share" },
  { name: "Username", uid: "account" },
  { name: "Proxied", uid: "proxied_sp" },
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

  const [sortBY, setSortBy] = React.useState<
    "share" | "account" | "proxied_sp"
  >("share");

  const filteredItems = React.useMemo(() => {
    let sortedItems = [...allRows];

    // Apply sorting
    sortedItems = sortByKey(
      sortedItems,
      sortBY,
      ["share", "proxied_sp"].includes(sortBY) ? "desc" : "asc"
    );

    return sortedItems;
  }, [allRows, sortBY]);

  return (
    <SModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      modalProps={{
        size: "xl",
        scrollBehavior: "inside",
        hideCloseButton: false,
      }}
      bodyClassName="mt-0 p-0"
      body={() => (
        <>
          {isLoading ? (
            <LoadingCard />
          ) : (
            allRows && (
              <div>
                <STable
                  data={filteredItems || []}
                  stickyHeader
                  titleClassName="w-full"
                  itemsPerPage={30}
                  filterByValue={"account"}
                  title={
                    <div className="flex flex-row items-center justify-between w-full">
                      <div className=" flex flex-row gap-2 items-center">
                        <p>Voters of</p>
                        <SAvatar
                          size="xs"
                          linkClassName="flex-row-reverse"
                          content={
                            <p className="font-normal text-sm">
                              {witness.name}
                            </p>
                          }
                          username={witness.name}
                        />
                      </div>

                      <Dropdown>
                        <DropdownTrigger>
                          <Button
                            size="sm"
                            variant="flat"
                            startContent={<IoFilterOutline size={18} />}
                            className="font-semibold text-small"
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
                            <DropdownItem
                              key={status.uid}
                              className="capitalize"
                            >
                              {capitalize(status.name)}
                            </DropdownItem>
                          ))}
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  }
                  tableRow={(item: WitnessVoteProps) => {
                    const ownSp = item.sp_own?.toLocaleString();
                    const ownProxied = item.proxied_sp?.toLocaleString();
                    const voteShare =
                      (parseFloat(
                        formatVotesInMillions(witness.received_votes.toString())
                      ) *
                        item.share) /
                        100 || 0;

                    return (
                      <div className="flex gap-2 items-start">
                        <SAvatar size="1xs" username={item.account} />

                        <div className=" flex flex-col gap-2">
                          <div className="flex flex-row gap-2 items-center">
                            <SLink href={`/@${item.account}`}>
                              {item.account}
                            </SLink>

                            {item.share >= 0.001 && (
                              <Chip
                                className="capitalize border-none gap-1 text-default-600"
                                color={"success"}
                                size="sm"
                                variant="flat"
                              >
                                {item.share?.toLocaleString()}%
                              </Chip>
                            )}

                            {voteShare >= 0.001 && (
                              <Chip
                                className="capitalize gap-1 text-default-600"
                                color={"default"}
                                size="sm"
                                variant="faded"
                              >
                                {voteShare.toLocaleString() + "M"}
                              </Chip>
                            )}
                          </div>

                          <p>own: {ownSp} SP</p>
                          {!!parseFloat(ownProxied || "0") && (
                            <p>proxied: {ownProxied} SP</p>
                          )}
                        </div>
                      </div>
                    );
                  }}
                />
              </div>
            )
          )}
        </>
      )}
      footer={(onClose) => (
        <Button color="danger" variant="flat" onPress={onClose}>
          Close
        </Button>
      )}
    />
  );
}
