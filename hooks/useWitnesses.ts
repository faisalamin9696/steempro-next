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
  const mv = vests / 1e12; // Convert to Mega Vests

  return mv.toLocaleString(undefined, { maximumFractionDigits: 2 });
}
