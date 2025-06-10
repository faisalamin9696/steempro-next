import useSWR from "swr";
import { fetchSds } from "@/constants/AppFunctions";

export function useSteemGlobals() {
  const { data, isValidating } = useSWR(
    "/steem_requests_api/getSteemProps",
    fetchSds<SteemProps>,
    {
      shouldRetryOnError: true,
      refreshInterval: 600_000,
      errorRetryInterval: 5_000,
    }
  );

  return { globalData: data, isValidatingGlobal: isValidating };
}
