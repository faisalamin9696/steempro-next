import { useAppSelector } from "@/constants/AppFunctions";
import React, { useEffect, useState } from "react";
import { getProposalVotes } from "@/libs/steem/condenser";
import useSWR from "swr";
import { getAccountsExt } from "@/libs/steem/sds";
import SAvatar from "./ui/SAvatar";
import SLink from "./ui/SLink";
import { vestToSteem } from "@/utils/helper/vesting";
import LoadingCard from "./LoadingCard";
import TableWrapper from "./wrappers/TableWrapper";
import { simpleVotesToSp } from "./ProposalItemCard";
import { twMerge } from "tailwind-merge";
import SModal from "./ui/SModal";

interface Props {
  proposal: Proposal;
  isOpen: boolean;
  onOpenChange: () => void;
}

const INITIAL_VISIBLE_COLUMNS = [
  "name",
  "vests_own",
  "proxied_vsf_votes",
  "share",
];

const columns = [
  { name: "VOTER", uid: "name", sortable: true },
  { name: "OWN SP", uid: "vests_own", sortable: true },
  { name: "PROXIED SP", uid: "proxied_vsf_votes", sortable: true },
  { name: "SHARE", uid: "share", sortable: true },
];

export default function ProposalVotersModal(props: Props) {
  let { proposal, isOpen, onOpenChange } = props;
  const shouldFetch = isOpen;
  const globalData = useAppSelector((state) => state.steemGlobalsReducer.value);

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

  const [filterValue, setFilterValue] = React.useState<any>("");

  const hasSearchFilter = Boolean(filterValue);

  const filteredItems = React.useMemo(() => {
    let filteredVotes = [...allRows];

    if (hasSearchFilter) {
      filteredVotes = filteredVotes.filter((votes) =>
        votes.name.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    return filteredVotes;
  }, [allRows, filterValue]);

  const renderCell = React.useCallback(
    (account: AccountExt, columnKey) => {
      const cellValue = account[columnKey];
      const ownSp = vestToSteem(
        account.vests_own,
        globalData.steem_per_share
      ).toLocaleString();

      const ownProxied = account.proxied_votes?.toLocaleString();

      const isInvalidProxy =
        account.proxy && !allRows.some((row) => row.name === account.proxy);

      const isValidProxy =
        account.proxy && allRows.some((row) => row.name === account.proxy);

      const title = isInvalidProxy
        ? `proxy to @${account.proxy}\n who didn't vote`
        : isValidProxy
        ? `Proxy to @${account.proxy}`
        : undefined;
      switch (columnKey) {
        case "name":
          return (
            <div className="flex flex-row items-start gap-1">
              <div className="flex flex-col gap-2">
                <div className="flex gap-2 items-center">
                  <SAvatar size="xs" username={account.name} />

                  <div className="flex flex-col gap-1">
                    <SLink
                      className=" hover:text-blue-500"
                      href={`/@${account.name}`}
                    >
                      {account.name}
                    </SLink>

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
              </div>
            </div>
          );

        case "vests_own":
          return (
            <div className="flex flex-col" title={title}>
              <p
                className={twMerge(
                  "text-bold text-small capitalize",
                  isInvalidProxy && "line-through text-warning-500"
                )}
              >
                {isValidProxy ? `(${ownSp})` : ownSp}
              </p>
            </div>
          );

        case "proxied_vsf_votes":
          return (
            <div className="flex flex-col" title={title}>
              <p
                className={twMerge(
                  "text-bold text-small capitalize",
                  isInvalidProxy && "line-through text-warning-500"
                )}
              >
                {isValidProxy ? `(${ownProxied})` : ownProxied}
              </p>
            </div>
          );

        case "share":
          return (
            <div className="flex flex-col" title={title}>
              <p
                className={twMerge(
                  "text-bold text-small capitalize",
                  isInvalidProxy && "line-through text-warning-500"
                )}
              >
                {isValidProxy
                  ? `(${account.share?.toLocaleString()})`
                  : account.share?.toLocaleString()}
                %
              </p>
            </div>
          );
        default:
          return cellValue;
      }
    },
    [allRows, globalData]
  );

  return (
    <SModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      modalProps={{ scrollBehavior: "inside", size: "xl" }}
      title={() => (
        <div className=" flex flex-row gap-2 items-center">
          <p>Voters</p>
          <div className="text-sm opacity-disabled flex flex-row items-center gap-1">
            <p>Proposal</p>
            <SLink
              className=" hover:text-blue-500"
              href={`/proposals/${proposal.id}`}
            >
              #{proposal.id}
            </SLink>
          </div>
        </div>
      )}
      subTitle={() => (
        <div className="text-sm font-normal flex flex-col gap-1">
          <p title="Direct votes from voters" className="opacity-disabled">
            Effective votes: {totalEffVotes.votes.toLocaleString() + " SP"} (
            {totalEffVotes.voters})
          </p>
          <p
            title="Voters witness proxy didn't vote"
            className="opacity-disabled"
          >
            Non-effective votes:{" "}
            {totalNonEffVotes.votes.toLocaleString() + " SP"} (
            {totalNonEffVotes.voters})
          </p>
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
                mobileVisibleColumns={["name", "vests_own", "share"]}
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
