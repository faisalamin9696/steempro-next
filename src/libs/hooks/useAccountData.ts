import useSWR from "swr";
import { getAccountExt } from "@/libs/steem/sds";

export function useAccountData(username?: string | null) {
  const { data, isValidating } = useSWR(
    username ? [username, "null"] : null,
    ([account, observer]) => getAccountExt(account, observer),
    {
      shouldRetryOnError: true,
      refreshInterval: 300_000,
      errorRetryInterval: 3_000,
    }
  );

  return { accountData: data, isValidatingAccount: isValidating };
}
