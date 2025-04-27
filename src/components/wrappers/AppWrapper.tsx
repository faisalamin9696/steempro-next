"uce client";

import { useAppDispatch, useAppSelector } from "@/libs/constants/AppFunctions";
import { useAccountData } from "@/libs/hooks/useAccountData";
import { useSteemGlobals } from "@/libs/hooks/useSteemGlobals";
import { useUnreadCounts } from "@/libs/hooks/useUnreadCounts";
import { addCommonDataHandler } from "@/libs/redux/reducers/CommonReducer";
import { saveLoginHandler } from "@/libs/redux/reducers/LoginReducer";
import { saveSteemGlobals } from "@/libs/redux/reducers/SteemGlobalReducer";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";

// let isPinged = false;

export default function AppWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const [username, setUsername] = useState<string | undefined | null>(
    session?.user?.name
  );
  const dispatch = useAppDispatch();
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const { globalData, isValidatingGlobal } = useSteemGlobals();
  const { accountData, isValidatingAccount } = useAccountData(username);
  const { unreadChatCount, unreadNotificationCount } = useUnreadCounts(
    session?.user?.name
  );

  // function pingForWitnessVote() {
  //   if (!isPinged) {
  //     toast(`Vote for witness (${WitnessAccount})`, {
  //       action: {
  //         label: "Vote",
  //         onClick: () => router.push("/witnesses"),
  //       },
  //       closeButton: false,
  //       duration: 10_000,
  //     });
  //     isPinged = true;
  //   }
  // }

  useEffect(() => {
    if (status === "authenticated" && session.user?.name) {
      setUsername(session.user.name);
    }
  }, [status, session?.user?.name]);

  useEffect(() => {
    dispatch(
      addCommonDataHandler({
        isLoadingAccount: isValidatingAccount || isValidatingGlobal,
      })
    );
  }, [isValidatingAccount, isValidatingGlobal]);

  useEffect(() => {
    dispatch(
      addCommonDataHandler({
        unread_count: unreadNotificationCount,
        unread_count_chat: unreadChatCount ?? 0,
      })
    );
  }, [unreadChatCount, unreadNotificationCount]);

  useEffect(() => {
    if (accountData) {
      dispatch(
        saveLoginHandler({
          ...(accountData ?? loginInfo),
        })
      );
    }
  }, [accountData]);

  useEffect(() => {
    if (globalData) {
      dispatch(saveSteemGlobals(globalData));
    }
  }, [globalData]);

  return <div>{children}</div>;
}
