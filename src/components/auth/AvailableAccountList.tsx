import React, { useEffect, useState } from "react";
import AccountItemCard from "./AccountItemCard";
import { getAllCredentials, getCredentials } from "@/libs/utils/user";
import LoadingCard from "../LoadingCard";

interface Props {
  handleSwitchSuccess: (user?: User) => void;
}
function AvailableAccountList(props: Props) {
  const { handleSwitchSuccess } = props;
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
    <div className="flex flex-row gap-2 overflow-x-auto p-1 scrollbar-thin">
      {isPending ? (
        <LoadingCard />
      ) : (
        accounts?.map((user) => {
          return (
            <div key={`${user?.username}-${user.type}`}>
              <AccountItemCard
                switchText="Login"
                isDisabled={isPending}
                user={user}
                handleSwitchSuccess={handleSwitchSuccess}
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
