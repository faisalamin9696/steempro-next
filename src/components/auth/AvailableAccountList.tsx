import React, { useEffect, useState } from "react";
import AccountItemCard from "./AccountItemCard";
import {
  getAllCredentials,
  getCredentials,
  refreshData,
} from "@/libs/utils/user";
import LoadingCard from "../LoadingCard";
import { twMerge } from "tailwind-merge";

interface Props {
  handleSwitchSuccess: (user?: User) => void;
  className?: string;
  switchText?: string;
}
function AvailableAccountList(props: Props) {
  const { handleSwitchSuccess, switchText, className } = props;
  const [accounts, setAccounts] = useState<User[]>();
  const [isPending, setIsPending] = useState(true);
  const credentials = getCredentials();

  useEffect(() => {
    const allCredentials = getAllCredentials();
    setAccounts(allCredentials);

    if (!allCredentials.length) {
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
                  // refreshData(user?.username);
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
