import { useAppSelector } from "@/libs/constants/AppFunctions";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getProposalVotes, ProposalVote } from "@/libs/steem/condenser";
import useSWR from "swr";
import { getAccountExt, getAccountsExt } from "@/libs/steem/sds";
import SAvatar from "./SAvatar";
import SLink from "./SLink";
import { steemToVest, vestToSteem } from "@/libs/helper/vesting";
import LoadingCard from "./LoadingCard";
import TableWrapper from "./wrappers/TableWrapper";
import { simpleVotesToSp } from "./ProposalItemCard";
import { twMerge } from "tailwind-merge";

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

  const votesStr =
    simpleVotesToSp(
      parseFloat(proposal.total_votes),
      globalData.total_vesting_shares,
      globalData.total_vesting_fund_steem
    )?.toLocaleString() + " SP";

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

    // Fetch voter account details in batches of 1000
    let allVoterDetails: AccountExt[] = [];
    for (let i = 0; i < allVoters.length; i += 1000) {
      let batch = allVoters.slice(i, i + 750);
      let accounts = await getAccountsExt(
        batch,
        "null",
        "name,proxy,vests_own,vests_in,vests_out,proxied_vsf_votes"
      );
      let mappedAccounts: AccountExt[] = [];

      if (accounts) {
        mappedAccounts = accounts.map((account) => {
          const total_proxied =
            parseFloat(account.proxied_vsf_votes?.[0] ?? "0") +
            parseFloat(account.proxied_vsf_votes?.[1] ?? "0");

          const total_sp: number =
            vestToSteem(account.vests_own, globalData.steem_per_share) +
            simpleVotesToSp(
              total_proxied,
              globalData.total_vesting_shares,
              globalData.total_vesting_fund_steem
            );

          // const totalSp = vestToSteem(total_vests, globalData.steem_per_share);
          const ratio =
            (total_sp /
              simpleVotesToSp(
                parseFloat(proposal.total_votes),
                globalData.total_vesting_shares,
                globalData.total_vesting_fund_steem
              )) *
            100;
          return {
            ...account,
            proxied_votes: total_proxied,
            share: ratio,
          };
        });
      }
      allVoterDetails = allVoterDetails.concat(mappedAccounts);
    }

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

      const ownProxied = simpleVotesToSp(
        account.proxied_votes ?? 0,
        globalData.total_vesting_shares,
        globalData.total_vesting_fund_steem
      )?.toLocaleString();

      const isInvalidProxy =
        account.proxy && !data?.some((row) => row.name === account.proxy);

      const isValidProxy =
        account.proxy && data?.some((row) => row.name === account.proxy);

      const title = isInvalidProxy
        ? `proxy to @${account.proxy}\n${account.proxy} who didn't vote`
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
                  <SLink
                    className=" hover:text-blue-500"
                    href={`/@${account.name}`}
                  >
                    {account.name}
                  </SLink>
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
                  isInvalidProxy && "line-through"
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
                  isInvalidProxy && "line-through"
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
                  isInvalidProxy && "line-through"
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
    [globalData, data]
  );

  return (
    <Modal
      size="xl"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="center"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-2">
              <p>
                Voters{" "}
                <span className="text-sm opacity-disabled">
                  Proposal #{proposal.id}
                </span>
              </p>
              <p className="text-tiny font-normal">
                <span className="opacity-disabled">Total votes:</span>{" "}
                {votesStr}
              </p>
            </ModalHeader>
            <ModalBody>
              {isLoading ? (
                <LoadingCard />
              ) : (
                allRows && (
                  <TableWrapper
                    filterValue={filterValue}
                    isCompact={false}
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
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
