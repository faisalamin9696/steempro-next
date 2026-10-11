import { mapSds } from "@steempro/sds-api";
import { sds } from "@/libs/sds-client";
import { AsyncUtils } from "@/utils/async.utils";
import { useState, useEffect } from "react";

export function useSubscriberCommunities(
  username: string,
  initialCommunity: Community | undefined
) {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) {
      setIsLoading(false);
      return;
    }
    const fetchWitnesses = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (initialCommunity) {
          await AsyncUtils.sleep(1);
          setCommunities([initialCommunity]);
          setIsLoading(false);
          return;
        }
        const communitiesData = mapSds<Community[]>(
          await sds.communities.getCommunitiesBySubscriber({
            subscriber: username,
            observer: "steem",
          }),
        );
        setCommunities(communitiesData);
      } catch (err) {
        console.error("Error fetching communities:", err);
        setError("Failed to fetch communities");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWitnesses();
  }, [username]);

  return { communities, isLoading, error };
}
