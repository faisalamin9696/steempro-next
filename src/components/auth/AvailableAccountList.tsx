"use client";

import React, { useEffect, useState } from "react";
import AccountItemCard from "./AccountItemCard";
import { getAllCredentials, getCredentials } from "@/utils/user";
import LoadingCard from "../LoadingCard";
import { twMerge } from "tailwind-merge";

interface Props {
  handleSwitchSuccess: (user?: User) => void;
  className?: string;
  switchText?: string;
  filter?: { username: string; type: Keys };
}
function AvailableAccountList(props: Props) {
  const { handleSwitchSuccess, switchText, className, filter } = props;
  const [accounts, setAccounts] = useState<User[]>();
  const [isPending, setIsPending] = useState(true);
  const credentials = getCredentials();

  useEffect(() => {
    const allCredentials = getAllCredentials();
    let filtered = allCredentials;
    if (filter) {
      const isDefault =
        credentials?.username === filter.username &&
        credentials?.type === filter.type;

      filtered = allCredentials.filter(
        (item) =>
          item.username === filter.username &&
          item.type === filter.type &&
          !isDefault
      );
    }
    setAccounts(filtered);

    if (!filtered.length) {
      setIsPending(false);
      return;
    }

    const timeOut = setTimeout(() => {
      setIsPending(false);
    }, 1000);

    return () => {
      clearTimeout(timeOut);
    };
  }, []);

  return (
    <div
      className={twMerge(
        "flex flex-row gap-2 overflow-x-auto p-1 scrollbar-thin",
        className
      )}
    >
      {isPending ? (
        <LoadingCard />
      ) : (
        accounts?.map((user) => {
          return (
            <div key={`${user?.username}-${user.type}`}>
              <AccountItemCard
                switchText={switchText ?? "Login"}
                isDisabled={isPending}
                user={user}
                handleSwitchSuccess={(user) => {
                  handleSwitchSuccess(user);
                }}
                defaultAccount={credentials}
              />
            </div>
          );
        })
      )}
    </div>
  );
}

export default React.memo(AvailableAccountList);
