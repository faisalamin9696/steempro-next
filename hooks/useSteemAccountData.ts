import { sdsApi } from "@/libs/sds";
import { useState, useEffect } from "react";

export const useSteemAccount = (
  username: string | undefined,
  account?: AccountExt,
  delegationType: "incoming" | "outgoing" | "expiring" | "all" = "all"
) => {
  const [accountData, setAccountData] = useState<AccountExt | null>(null);
  const [delegations, setDelegations] = useState<{
    incoming: Delegation[];
    outgoing: Delegation[];
    expiring: Delegation[];
  }>({ incoming: [], outgoing: [], expiring: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) {
      setAccountData(null);
      setDelegations({ incoming: [], outgoing: [], expiring: [] });
      return;
    }

    const fetchAccountData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (!account) {
          const account = await sdsApi.getAccountExt(username);
          if (account) {
            setAccountData(account);
          } else {
            setError("Account not found");
          }
        } else {
          setAccountData(account);
        }
        // Fetch delegations and history
        try {
          const delegations = await sdsApi.getDelegations(username, delegationType ?? 'all');

          setDelegations({
            incoming: delegations?.filter((d) => d.status === 'incoming') ?? [],
            outgoing: delegations?.filter((d) => d.status === 'outgoing') ?? [],
            expiring: delegations?.filter((d) => d.status === 'expiring') ?? [],
          });
        } catch (err) {
          console.error("Error fetching delegations:", err);
        }
      } catch (err) {
        setError("Failed to fetch account data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccountData();
  }, [username]);

  return { accountData, delegations, isLoading, error };
};
