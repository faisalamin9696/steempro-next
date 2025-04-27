"uce client";

import { useAppDispatch, useAppSelector } from "@/libs/constants/AppFunctions";
import { useAccountData } from "@/libs/hooks/useAccountData";
import { useSteemGlobals } from "@/libs/hooks/useSteemGlobals";
import { useUnreadCounts } from "@/libs/hooks/useUnreadCounts";
import { addCommonDataHandler } from "@/libs/redux/reducers/CommonReducer";
import { saveLoginHandler } from "@/libs/redux/reducers/LoginReducer";
import { saveSteemGlobals } from "@/libs/redux/reducers/SteemGlobalReducer";
import { useSession } from "next-auth/react";
import { useRouter } from "next13-progressbar";
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
  const router = useRouter();
  const loginInfo = useAppSelector((state) => state.loginReducer.value);

  const { globalData, isValidatingGlobal } = useSteemGlobals();
  const { accountData, isValidatingAccount } = useAccountData(username);
  const { unreadChatCount, unreadNotificationCount } = useUnreadCounts(
    loginInfo?.name
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
    if (accountData || unreadChatCount) {
      dispatch(
        saveLoginHandler({
          ...(accountData ?? loginInfo),
          unread_count:
            loginInfo?.name === username ? loginInfo?.unread_count ?? 0 : 0,
          unread_count_chat:
            unreadChatCount ?? loginInfo?.unread_count_chat ?? 0,
        })
      );
    }
    if (globalData) {
      dispatch(saveSteemGlobals(globalData));
    }
  }, [globalData, accountData, unreadChatCount, loginInfo?.name, username]);

  useEffect(() => {
    if (unreadNotificationCount !== undefined) {
      dispatch(
        saveLoginHandler({
          ...loginInfo,
          unread_count: unreadNotificationCount,
        })
      );
    }
  }, [unreadNotificationCount]);

  return <div>{children}</div>;
}
