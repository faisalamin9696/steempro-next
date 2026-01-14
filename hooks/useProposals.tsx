import { sdsApi } from "@/libs/sds";
import useSWR from "swr";
import { useSteemUtils } from "./useSteemUtils";

export function useProposals() {
  const {
    data: proposals,
    isLoading: loading,
    error,
    mutate,
  } = useSWR<Proposal[]>("proposals_list", () => sdsApi.getProposals());

  return { proposals: proposals || [], loading, error, mutate };
}

export function formatProposalVotes(votes: string | number): string {
  const vests = parseFloat(String(votes)) / 1000;

  if (vests >= 1e15) {
    return (vests / 1e15).toFixed(3) + "T";
  } else if (vests >= 1e12) {
    return (vests / 1e12).toFixed(3) + "B";
  } else if (vests >= 1e9) {
    return (vests / 1e9).toFixed(3) + "M";
  } else if (vests >= 1e6) {
    return (vests / 1e6).toFixed(3) + "K";
  }
  return vests.toFixed(3);
}

export function getProposalStatus(
  proposal: Proposal
): "upcoming" | "expired" | "active" {
  if (
    new Date(proposal.start_date) < new Date() &&
    new Date(proposal.end_date) >= new Date()
  ) {
    return "active";
  } else if (new Date(proposal.end_date) < new Date()) {
    return "expired";
  } else {
    return "upcoming";
  }
}

export type ProposalVoterData = AccountExt & {
  proxied_votes: number;
  share: number;
};

export function useProposalVoters(proposalId?: number) {
  const { vestsToSteem } = useSteemUtils();
  const { data, isLoading, error } = useSWR(
    proposalId || proposalId === 0 ? `proposal-voters-${proposalId}` : null,
    async () => {
      if (!proposalId && proposalId !== 0)
        return {
          voters: [],
          effective: { votes: 0, count: 0 },
          notEffective: { votes: 0, count: 0 },
          totalVotes: 0,
        };
      let allVoters: string[] = [];
      let lastVoter = "";

      // Fetch all proposal voters
      while (true) {
        let proposalVoters = await sdsApi.getProposalVotes(
          proposalId,
          lastVoter,
          1000
        );

        if (!proposalVoters || proposalVoters.length === 0) break;

        allVoters = allVoters.concat(
          proposalVoters.map((voter) => voter.voter)
        );

        if (proposalVoters.length < 1000) break;

        lastVoter = proposalVoters[proposalVoters.length - 1].voter;
      }

      // Remove duplicates just in case
      allVoters = [...new Set(allVoters)];

      let allAccounts: AccountExt[] = [];

      for (let i = 0; i < allVoters.length; i += 750) {
        let batch = allVoters.slice(i, i + 750);
        if (batch.length === 0) continue;

        let accounts = await sdsApi.getAccountsExt(batch, "null", [
          "name",
          "proxy",
          "vests_own",
          "vests_in",
          "vests_out",
          "proxied_vsf_votes",
        ]);

        if (accounts) {
          allAccounts = allAccounts.concat(accounts);
        }
      }

      function getAccountTotalSp(row: AccountExt) {
        return (
          vestsToSteem(row.vests_own) +
          vestsToSteem(
            (parseFloat(row.proxied_vsf_votes?.[0] ?? "0") +
              parseFloat(row.proxied_vsf_votes?.[1] ?? "0")) /
              1000000
          )
        );
      }

      const { effVotes, effvoteCount } = allAccounts.reduce(
        (acc, row) => {
          if (
            !row.proxy ||
            (row.proxy && allAccounts.some((r) => r.name === row.proxy))
          ) {
            acc.effVotes += getAccountTotalSp(row);
            acc.effvoteCount += 1;
          }
          return acc;
        },
        { effVotes: 0, effvoteCount: 0 }
      );

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

      let allVoterDetails: ProposalVoterData[] = allAccounts.map((account) => {
        const total_proxied = vestsToSteem(
          (parseFloat(account.proxied_vsf_votes?.[0] ?? "0") +
            parseFloat(account.proxied_vsf_votes?.[1] ?? "0")) /
            1000000
        );

        const total_votes_sp = nonEffVotes + effVotes;

        const ratio = (getAccountTotalSp(account) / total_votes_sp) * 100;

        return {
          ...account,
          proxied_votes: total_proxied,
          share: ratio,
        };
      });

      // sort by share desc
      return {
        voters: allVoterDetails.sort((a, b) => b.share - a.share),
        effective: { votes: effVotes, count: effvoteCount },
        notEffective: { votes: nonEffVotes, count: nonEffvoteCount },
        totalVotes: effVotes + nonEffVotes,
      };
    }
  );

  return {
    voters: data?.voters || [],
    isLoading,
    error,
    effective: data?.effective || { votes: 0, count: 0 },
    notEffective: data?.notEffective || { votes: 0, count: 0 },
    totalVotes: data?.totalVotes || 0,
  };
}
