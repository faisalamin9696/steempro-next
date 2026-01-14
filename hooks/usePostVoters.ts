import { sdsApi } from "@/libs/sds";
import { useState, useEffect } from "react";

export function usePostVoters(
  author: string,
  permlink: string,
  enabled?: boolean
) {
  const [voters, setVoters] = useState<PostVote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !author || !permlink) return;
    const fetchWitnesses = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const votersData = await sdsApi.getVoters(author, permlink);

        setVoters(votersData);
      } catch (err) {
        console.error("Error fetching voters:", err);
        setError("Failed to fetch voters");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWitnesses();
  }, [author, permlink]);

  return { voters, isLoading, error };
}
