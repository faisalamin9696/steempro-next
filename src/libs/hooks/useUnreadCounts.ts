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

export function useUnreadCounts(loginName?: string | null) {
  const url = loginName
    ? `/notifications_api/getFilteredUnreadCount/${loginName}/${JSON.stringify(
        filter
      )}`
    : null;

  const { data: unreadChatCount } = useSWR(
    loginName ? `unread-chat-${loginName}` : null,
    () => getUnreadChatCount(loginName!),
    {
      shouldRetryOnError: true,
      refreshInterval: 310_000,
      errorRetryInterval: 20_000,
    }
  );

  const { data: unreadNotificationCount } = useSWR(
    url ? `unread-notification-count-${loginName}` : null, // custom key for mutate
    () => fetchSds<number>(url!), // manually call fetchSds with your URL
    {
      shouldRetryOnError: true,
      refreshInterval: 300_000,
      errorRetryInterval: 10_000,
    }
  );

  return { unreadChatCount, unreadNotificationCount };
}
