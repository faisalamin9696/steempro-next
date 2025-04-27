import useSWR from "swr";
import { getUnreadChatCount } from "@/libs/steem/mysql";
import { fetchSds } from "@/libs/constants/AppFunctions";
import { DefaultNotificationFilters } from "@/libs/constants/AppConstants";

const defFilter = DefaultNotificationFilters;

const filter = {
  mention: {
    exclude: defFilter.mention.status,
    minSP: defFilter.mention.minSp,
    minReputation: defFilter.mention.minRep,
  },
  vote: {
    exclude: defFilter.vote.status,
    minVoteAmount: defFilter.vote.minVote,
    minReputation: defFilter.vote.minRep,
    minSP: defFilter.vote.minSp,
  },
  follow: {
    exclude: defFilter.follow.status,
    minSP: defFilter.follow.minSp,
    minReputation: defFilter.follow.minRep,
  },
  resteem: {
    exclude: defFilter.resteem.status,
    minSP: defFilter.resteem.minSp,
    minReputation: defFilter.resteem.minRep,
  },
  reply: {
    exclude: defFilter.reply.status,
    minSP: defFilter.reply.minSp,
    minReputation: defFilter.reply.minRep,
  },
};

export function useUnreadCounts(username?: string | null) {
  const url = username
    ? `/notifications_api/getFilteredUnreadCount/${username}/${JSON.stringify(
        filter
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
