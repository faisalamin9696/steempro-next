import { fetchSds } from "@/constants/AppFunctions";
import { useQuery } from "@tanstack/react-query";

export const useWitnesses = (observer?: string | null) => {
  const URL = `/witnesses_api/getWitnessesByRank/${observer || "null"}/100`;

  return useQuery({
    queryKey: ["witnessesList"],
    queryFn: () => fetchSds<Witness[]>(URL),
  });
};

// Helper function to format votes in millions
const formatVotesInMillions = (rawVests: string): string => {
  const vests = parseFloat(rawVests);
  const millions = vests / 1000000000000000; // Convert to millions (15 zeros)
  return `${millions.toFixed(3)}M`;
};

// Helper function to check if witness is disabled due to signing key
const isWitnessDisabledByKey = (witness: any): boolean => {
  return witness.signing_key && witness.signing_key.startsWith("STM1111111111");
};

// Helper function to check if witness has invalid version
const hasInvalidVersion = (witness: any): boolean => {
  return witness.running_version !== "0.23.1";
};

export const useWitnessData = (account?: AccountExt | null) => {
  const {
    data: witnesses,
    isLoading: witnessesLoading,
    error: witnessesError,
  } = useWitnesses(account?.name);

  const userWitnessVotes = account?.witness_votes || [];

  const formattedWitnesses =
    witnesses?.map((witness, index) => {
      const isDisabledByKey = isWitnessDisabledByKey(witness);
      const hasInvalidVer = hasInvalidVersion(witness);

      return {
        ...witness,
        name: witness.name,
        votes: formatVotesInMillions(witness.received_votes?.toString()),
        voted: userWitnessVotes.includes(witness.name) && !account?.proxy,
        rank: index + 1,
        version: witness.running_version,
        url: witness.url,
        missedBlocks: witness.missed_blocks,
        lastBlock: witness.last_confirmed_block,
        signing_key: witness.signing_key,
        isDisabledByKey,
        hasInvalidVersion: hasInvalidVer,
        isDisabled: isDisabledByKey || hasInvalidVer,
        received_votes: witness.received_votes,
        price: witness.reported_price.base,
      };
    }) || [];

  const rawOwnWitness = witnesses?.find((item) => item.name === account?.name);
  const formattedOwnWitness = formattedWitnesses?.find(
    (item) => item.name === account?.name
  );

  return {
    witnesses: formattedWitnesses,
    isLoading: witnessesLoading,
    error: witnessesError,
    userVoteCount: userWitnessVotes.length,
    userData: account,
    ownWitness: formattedOwnWitness &&
      rawOwnWitness && {
        ...(rawOwnWitness || {}),
        ...(formattedOwnWitness || {}),
      },
  };
};
