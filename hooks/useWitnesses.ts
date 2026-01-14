import { sdsApi } from "@/libs/sds";
import { useState, useEffect } from "react";

export function useWitnesses(
  limit: number = 100,
  observer: string | null = "steem"
) {
  const [witnesses, setWitnesses] = useState<Witness[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWitnesses = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const witnessesWithRank = await sdsApi.getWitnessesByRank(observer);

        setWitnesses(witnessesWithRank);
      } catch (err) {
        console.error("Error fetching witnesses:", err);
        setError("Failed to fetch witnesses");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWitnesses();
  }, [limit, observer]);

  return { witnesses, isLoading, error };
}

export function formatVotes(votes: string): string {
  const vests = parseFloat(votes);
  if (vests >= 1e15) {
    return (vests / 1e15).toFixed(2) + "T";
  } else if (vests >= 1e12) {
    return (vests / 1e12).toFixed(2) + "B";
  } else if (vests >= 1e9) {
    return (vests / 1e9).toFixed(2) + "M";
  } else if (vests >= 1e6) {
    return (vests / 1e6).toFixed(2) + "K";
  }
  return vests.toFixed(0);
}
