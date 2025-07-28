import { useAppSelector } from "@/constants/AppFunctions";
import React, { useEffect, useState } from "react";
import { getProposalVotes } from "@/libs/steem/condenser";
import useSWR from "swr";
import { getAccountsExt } from "@/libs/steem/sds";
import SAvatar from "./ui/SAvatar";
import SLink from "./ui/SLink";
import { vestToSteem } from "@/utils/helper/vesting";
import LoadingCard from "./LoadingCard";
import { simpleVotesToSp } from "./ProposalItem";
import { twMerge } from "tailwind-merge";
import SModal from "./ui/SModal";
import STable from "./ui/STable";
import { Chip } from "@heroui/chip";
import { sortByKey } from "@/utils/helper";
import { capitalize } from "@/constants/AppConstants";
import { Button } from "@heroui/button";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { IoFilterOutline } from "react-icons/io5";
import { useDeviceInfo } from "@/hooks/useDeviceInfo";

interface Props {
  proposal: Proposal;
  isOpen: boolean;
  onOpenChange: () => void;
}

const sortOptions = [
  { name: "Share", uid: "share" },
  { name: "Username", uid: "username" },
  { name: "Proxied", uid: "proxied_votes" },
];

export default function ProposalVotersModal(props: Props) {
  let { proposal, isOpen, onOpenChange } = props;
  const shouldFetch = isOpen;
  const globalData = useAppSelector((state) => state.steemGlobalsReducer.value);
  const { isMobile } = useDeviceInfo();

  const { data, isLoading } = useSWR<AccountExt[]>(
    shouldFetch ? `proposals-votes-${proposal.id}` : null,
    () => fetchVotersData(proposal.id)
  );
  const [allRows, setAllRows] = useState<AccountExt[]>([]);
  let [totalEffVotes, setTotalEffVotes] = useState<{
    voters: number;
    votes: number;
  }>({ voters: 0, votes: 0 });

  let [totalNonEffVotes, setTotalNonEffVotes] = useState<{
    voters: number;
    votes: number;
  }>({ voters: 0, votes: 0 });

  const fetchVotersData = async (id: number): Promise<AccountExt[]> => {
    let allVoters: string[] = [];
    let lastVoter = ""; // Used for pagination

    // Fetch all proposal voters
    while (true) {
      let proposalVoters = await getProposalVotes(id, lastVoter, 1000);

      if (!proposalVoters || proposalVoters.length === 0) break;

      allVoters = allVoters.concat(proposalVoters.map((voter) => voter.voter));

      if (proposalVoters.length < 1000) break;

      lastVoter = proposalVoters[proposalVoters.length - 1].voter;
    }

    let allAccounts: AccountExt[] = [];

    for (let i = 0; i < allVoters.length; i += 1000) {
      let batch = allVoters.slice(i, i + 750);
      let accounts = await getAccountsExt(
        batch,
        "null",
        "name,proxy,vests_own,vests_in,vests_out,proxied_vsf_votes"
      );

      if (accounts) {
        allAccounts = allAccounts.concat(accounts);
      }
    }

    function getAccountTotalSp(row: AccountExt) {
      return (
        vestToSteem(row.vests_own, globalData.steem_per_share) +
        simpleVotesToSp(
          parseFloat(row.proxied_vsf_votes?.[0] ?? "0") +
            parseFloat(row.proxied_vsf_votes?.[1] ?? "0"),
          globalData.total_vesting_shares,
          globalData.total_vesting_fund_steem
        )
      );
    }

    const { effVotes, effvoteCount } = allAccounts.reduce(
      (acc, row) => {
        if (
          !row.proxy || // No proxy → Effective voter
          (row.proxy && allRows.some((row) => row.name === row.proxy)) // proxy and proxy vote found
        ) {
          acc.effVotes += getAccountTotalSp(row);
          acc.effvoteCount += 1;
        }
        return acc;
      },
      { effVotes: 0, effvoteCount: 0 }
    );

    setTotalEffVotes({ votes: effVotes, voters: effvoteCount });

    const { nonEffVotes, nonEffvoteCount } = allAccounts.reduce(
      (acc, row) => {
        if (row.proxy && !allAccounts.some((acc) => acc.name === row.proxy)) {
          acc.nonEffVotes += getAccountTotalSp(row);
          acc.nonEffvoteCount += 1;
        }
        return acc;
      },
      { nonEffVotes: 0, nonEffvoteCount: 0 }
    );

    setTotalNonEffVotes({ voters: nonEffvoteCount, votes: nonEffVotes });

    let allVoterDetails: AccountExt[] = [];

    // ✅ Step 2: Calculate `proxied_votes` and `share` after the loop
    allVoterDetails = allAccounts.map((account) => {
      const total_proxied = simpleVotesToSp(
        parseFloat(account.proxied_vsf_votes?.[0] ?? "0") +
          parseFloat(account.proxied_vsf_votes?.[1] ?? "0"),
        globalData.total_vesting_shares,
        globalData.total_vesting_fund_steem
      );

      const total_votes_sp = nonEffVotes + effVotes;

      const ratio = (getAccountTotalSp(account) / total_votes_sp) * 100;

      return {
        ...account,
        proxied_votes: total_proxied,
        share: ratio,
      };
    });

    return allVoterDetails;
  };

  useEffect(() => {
    if (data) setAllRows(data);
  }, [data]);

  const [sortBY, setSortBy] = React.useState<
    "share" | "name" | "proxied_votes"
  >("share");

  const filteredItems = React.useMemo(() => {
    let sortedItems = [...allRows];

    // Apply sorting
    sortedItems = sortByKey(
      sortedItems,
      sortBY,
      ["share", "proxied_votes"].includes(sortBY) ? "desc" : "asc"
    );

    return sortedItems;
  }, [allRows, sortBY]);


  return (
    <SModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      modalProps={{ scrollBehavior: "inside", size: "xl" }}
      bodyClassName="mt-0 p-0"
      body={() => (
        <>
          {isLoading ? (
            <LoadingCard />
          ) : (
            filteredItems && (
              <div>
                <STable
                  stickyHeader={!isMobile}
                  itemsPerPage={30}
                  bodyClassName="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-4"
                  titleClassName="flex flex-col gap-4 w-full"
                  title={
                    <div className="flex flex-row items-center justify-between w-full">
                      <div className=" flex flex-row gap-2 items-center">
                        <p>Voters</p>
                        <div className="text-sm text-default-500 flex flex-row items-center gap-1">
                          <p>Proposal</p>
                          <SLink
                            className=" hover:text-blue-500"
                            href={`/proposals/${proposal.id}`}
                          >
                            #{proposal.id}
                          </SLink>
                        </div>
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
                  
                  data={filteredItems || []}
                  tableRow={(account: AccountExt) => {
                    const ownSp = vestToSteem(
                      account.vests_own,
                      globalData.steem_per_share
                    ).toLocaleString();

                    const ownProxied = account.proxied_votes?.toLocaleString();

                    const isInvalidProxy =
                      account.proxy &&
                      !allRows.some((row) => row.name === account.proxy);

                    const isValidProxy =
                      account.proxy &&
                      allRows.some((row) => row.name === account.proxy);

                    const title = isInvalidProxy
                      ? `proxy to @${account.proxy}\n who didn't vote`
                      : isValidProxy
                      ? `Proxy to @${account.proxy}`
                      : undefined;
                    return (
                      <div className="flex gap-2 items-start">
                        <SAvatar size="1xs" username={account.name} />

                        <div className=" flex flex-col gap-2">
                          <div className="flex flex-row gap-2">
                            <SLink
                              className=" hover:text-blue-500"
                              href={`/@${account.name}`}
                            >
                              {account.name}
                            </SLink>

                            <Chip
                              className="capitalize border-none gap-1 text-default-600"
                              color={"success"}
                              size="sm"
                              variant="flat"
                            >
                              {account.share?.toLocaleString()}%
                            </Chip>
                          </div>

                          <p>own: {ownSp} SP</p>
                          {!!parseFloat(ownProxied || "0") && (
                            <p>proxied: {ownProxied} SP</p>
                          )}

                          <p
                            className={twMerge(
                              "text-xs text-default-500",
                              isInvalidProxy && "text-warning-500"
                            )}
                          >
                            {title}
                          </p>
                        </div>
                      </div>
                    );
                  }}
                  description={
                    <div className="flex flex-row text-start justify-between">
                      <div className="flex flex-wrap gap-2">
                        <Chip variant="flat" color="success" title="Direct votes from voters">
                          Effective SP:{" "}
                          {totalEffVotes.votes.toLocaleString() + " SP"} (
                          {totalEffVotes.voters})
                        </Chip>
                        <Chip variant="flat"
                          color="warning"
                          title="Voters witness proxy didn't vote"
                        >
                          Non-effective SP:{" "}
                          {totalNonEffVotes.votes.toLocaleString() + " SP"} (
                          {totalNonEffVotes.voters})
                        </Chip>
                      </div>
                    </div>
                  }
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
