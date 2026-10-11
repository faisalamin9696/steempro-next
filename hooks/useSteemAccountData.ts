import { mapSds } from "@steempro/sds-api";
import { sds } from "@/libs/sds-client";
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
          const account = mapSds<AccountExt>(
            await sds.accounts.getAccountExt({
              account: username,
              observer: "steem",
            }),
          );
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
          const fetchDelegations = async (
            type: "incoming" | "outgoing" | "expiring" | "all",
          ): Promise<Delegation[]> => {
            if (type === "all") {
              const [incoming, outgoing, expiring] = await Promise.all([
                fetchDelegations("incoming"),
                fetchDelegations("outgoing"),
                fetchDelegations("expiring"),
              ]);
              return [...incoming, ...outgoing, ...expiring];
            }
            const result = mapSds<Delegation[]>(
              await (type === "outgoing"
                ? sds.delegations.getOutgoingDelegations({
                    account: username,
                    limit: 1000,
                    offset: 0,
                  })
                : type === "expiring"
                  ? sds.delegations.getExpiringDelegations({
                      account: username,
                      limit: 1000,
                      offset: 0,
                    })
                  : sds.delegations.getIncomingDelegations({
                      account: username,
                      limit: 1000,
                      offset: 0,
                    })),
            );
            return (result ?? []).map((item) => ({ ...item, status: type }));
          };
          const delegations = await fetchDelegations(delegationType ?? 'all');

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
