import useSWR from "swr";
import { getUnreadChatCount } from "@/libs/steem/mysql";
import { fetchSds } from "@/constants/AppFunctions";
import { NotificationFilter } from "@/constants/AppConstants";

export function useUnreadCounts(username?: string | null) {
  const url = username
    ? `/notifications_api/getFilteredUnreadCount/${username}/${JSON.stringify(
        NotificationFilter
      )}`
    : null;

  const { data: unreadChatCount } = useSWR(
    username ? `unread-chat-${username}` : null,
    () => getUnreadChatCount(username!),
    {
      shouldRetryOnError: true,
      refreshInterval: 310_000,
      errorRetryInterval: 20_000,
      dedupingInterval: 10_000,
    }
  );

  const { data: unreadNotificationCount } = useSWR(
    url ? `unread-notification-count-${username}` : null, // custom key for mutate
    () => fetchSds<number>(url!), // manually call fetchSds with your URL
    {
      shouldRetryOnError: true,
      refreshInterval: 300_000,
      errorRetryInterval: 10_000,
      dedupingInterval: 10_000,
    }
  );

  return { unreadChatCount, unreadNotificationCount };
}
