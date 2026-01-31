"use client";

import { Constants } from "@/constants";
import { clearCommentHandler } from "@/hooks/redux/reducers/CommentReducer";
import { addCommonDataHandler } from "@/hooks/redux/reducers/CommonReducer";
import { addGlobalPropsHandler } from "@/hooks/redux/reducers/GlobalPropsReducer";
import { addLoginHandler } from "@/hooks/redux/reducers/LoginReducer";
import { updateSettingsHandler } from "@/hooks/redux/reducers/SettingsReducer";
import { useAppDispatch } from "@/hooks/redux/store";
import { sdsApi } from "@/libs/sds";
import { updateClient } from "@/libs/steem";
import { updateActiveSettings } from "@/utils";
import { getSettings } from "@/utils/user";
import { useSession } from "next-auth/react";
import React, { useEffect } from "react";
import useSWR from "swr";

function AppWrapper({
  children,
  globals,
}: {
  children: React.ReactNode;
  globals?: GlobalProps;
}) {
  const { data: session } = useSession();
  const dispatch = useAppDispatch();

  // New useEffect to handle initial globals prop
  useEffect(() => {
    if (globals) {
      Constants.globalProps = globals;
      dispatch(addGlobalPropsHandler(globals));
    }
  }, [globals, dispatch]); // Added dispatch and globals to dependency array for correctness

  const { data: globalProps } = useSWR<GlobalProps>(
    () => (session?.user?.name ? `globals` : null),
    () => sdsApi.getGlobalProps(),
  );

  const { data: accountData } = useSWR<AccountExt>(
    () => (session?.user?.name ? `account-${session.user.name}` : null),
    () => sdsApi.getAccountExt(session?.user?.name || ""),
  );

  const { data: unreadNotificationsCount } = useSWR<number>(
    () =>
      session?.user?.name
        ? `account-unread-notifications-${session.user.name}`
        : null,
    () => sdsApi.getUnreadNotificationsCount(session?.user?.name || ""),
  );
  useEffect(() => {
    if (globalProps) {
      Constants.globalProps = globalProps;
      dispatch(addGlobalPropsHandler(globalProps));
    }
  }, [globalProps]);

  useEffect(() => {
    const settings = getSettings();
    dispatch(updateSettingsHandler(settings));
    updateActiveSettings(settings);
    updateClient();
  }, [dispatch]);

  useEffect(() => {
    dispatch(clearCommentHandler());

    if (accountData) {
      dispatch(addLoginHandler(accountData));
      dispatch(
        addCommonDataHandler({
          unread_notifications_count: unreadNotificationsCount,
        }),
      );
    }
  }, [accountData, unreadNotificationsCount]);

  return (
    <div>
      {children}
      <MigrationModal />
      <GamingZoneAnnouncementModal />
    </div>
  );
}

import MigrationModal from "../ui/MigrationModal";
import GamingZoneAnnouncementModal from "../games/GamingZoneAnnouncementModal";

export default AppWrapper;
