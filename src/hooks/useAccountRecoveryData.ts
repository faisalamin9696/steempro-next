import useSWR from "swr";
import { client } from "@/libs/steem/condenser";

export function useAccountRecoveryData(username?: string | null) {
  const { data, isValidating } = useSWR(
    [`${username}-recovery`],
    async () => {
      try {
        const response = await client.call(
          "database_api",
          "find_change_recovery_account_requests",
          {
            accounts: [username],
          }
        );
        if (response?.requests) {
          return response?.requests?.[0] as AccountRecoveryType;
        }
      } catch (error) {
        throw error;
      }
    },

    {
      shouldRetryOnError: true,
      refreshInterval: 300_000,
      errorRetryInterval: 3_000,
    }
  );

  return { recoveryData: data, isValidatingAccount: isValidating };
}
