import { sdsApi } from "@/libs/sds";
import { useState, useCallback } from "react";
import { handleSteemError } from "@/utils/steemApiError";
import { steemApi } from "@/libs/steem";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { addCommonDataHandler } from "./redux/reducers/CommonReducer";
import { AsyncUtils } from "@/utils/async.utils";
import { useAccountsContext } from "@/components/auth/AccountsContext";

export interface CustomNotification {
  id: number;
  type: NotificationType;
  timestamp: number;
  from: string;
  message: string;
  url: string;
  voted_rshares?: number;
  read: boolean;
}

const LIMIT = 50;

interface CacheEntry {
  notifications: CustomNotification[];
  hasMore: boolean;
}

// Module level cache to keep data stale for the session
const notificationCache = new Map<string, CacheEntry>();

const parseNotifications = (
  history: SDSNotification[],
  username: string
): CustomNotification[] => {
  const newNotifications: CustomNotification[] = [];
  if (!history) return newNotifications;

  for (const {
    id,
    time,
    type,
    author,
    permlink,
    account,
    is_read,
    voted_rshares,
  } of history) {
    let notification: CustomNotification | null = null;
    const timestamp = time;

    switch (type) {
      case "vote":
        notification = {
          id: id,
          type: "vote",
          timestamp,
          from: account,
          message: `voted on your post`,
          url: `/@${author}/${permlink}`,
          read: Boolean(is_read),
          voted_rshares: voted_rshares,
        };
        break;

      case "mention":
        notification = {
          id: id,
          type: "mention",
          timestamp,
          from: account,
          message: `mentioned you`,
          url: `/@${author}/${permlink}`,
          read: Boolean(is_read),
        };
        break;

      case "reply":
        notification = {
          id: id,
          type: "reply",
          timestamp,
          from: author,
          message: `replied to your post`,
          url: `/@${author}/${permlink}`,
          read: Boolean(is_read),
        };
        break;

      case "resteem":
        notification = {
          id: id,
          type: "resteem",
          timestamp,
          from: account,
          message: `resteemed your post`,
          url: `/@${author}/${permlink}`,
          read: Boolean(is_read),
        };
        break;
      case "follow":
        notification = {
          id: id,
          type: "follow",
          timestamp,
          from: account,
          message: `followed you`,
          url: `/@${account}/${permlink}`,
          read: Boolean(is_read),
        };
        break;
    }

    if (notification) {
      newNotifications.push(notification);
    }
  }

  return newNotifications.sort((a, b) => b.timestamp - a.timestamp);
};

export const useNotifications = (username: string | undefined) => {
  const [loading, setLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const { authenticateOperation } = useAccountsContext();

  const getCacheKey = useCallback(
    (type: string) => `${username}_${type}`,
    [username]
  );

  const [notifications, setNotifications] = useState<CustomNotification[]>(
    () => {
      if (username) {
        return notificationCache.get(getCacheKey("all"))?.notifications || [];
      }
      return [];
    }
  );

  const [hasMore, setHasMore] = useState(() => {
    if (username) {
      return notificationCache.get(getCacheKey("all"))?.hasMore ?? true;
    }
    return true;
  });

  const fetchNotifications = useCallback(
    async (reset: boolean = false, typeFilter: NotificationType | "all") => {
      if (!username) {
        setNotifications([]);
        setHasMore(false);
        return;
      }

      const cacheKey = getCacheKey(typeFilter);
      const cached = notificationCache.get(cacheKey);

      if (reset && cached && cached.notifications.length > 0) {
        setNotifications(cached.notifications);
        setHasMore(cached.hasMore);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const history = await sdsApi.getNotifications(
          username,
          typeFilter,
          LIMIT
        );
        const parsed = parseNotifications(history, username);
        const more = parsed.length === LIMIT;

        if (reset) {
          setNotifications(parsed);
          setHasMore(more);
          notificationCache.set(cacheKey, {
            notifications: parsed,
            hasMore: more,
          });
        } else {
          setNotifications((prev) => {
            const updated = [...prev, ...parsed];
            notificationCache.set(cacheKey, {
              notifications: updated,
              hasMore: more,
            });
            return updated;
          });
          setHasMore(more);
        }
      } catch (err) {
        setError("Failed to fetch notifications");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [username, getCacheKey]
  );

  const markAsRead = useCallback(
    (id: number) => {
      setNotifications((prev) => {
        const updated = prev.map((n) =>
          n.id === id ? { ...n, read: true } : n
        );
        notificationCache.forEach((entry, key) => {
          if (key.startsWith(`${username}_`)) {
            notificationCache.set(key, {
              ...entry,
              notifications: entry.notifications.map((n) =>
                n.id === id ? { ...n, read: true } : n
              ),
            });
          }
        });
        return updated;
      });
    },
    [username]
  );

  const markAllAsRead = async () => {
    if (!username) return;
    setIsPending(true);
    await handleSteemError(async () => {
      const { key, useKeychain } = await authenticateOperation("posting");
      await steemApi.markAsRead(username, key, useKeychain);
      await AsyncUtils.sleep(2);
      dispatch(addCommonDataHandler({ unread_notifications_count: 0 }));
      setNotifications((prev) => {
        const updated = prev.map((n) => ({ ...n, read: true }));
        notificationCache.forEach((entry, key) => {
          if (key.startsWith(`${username}_`)) {
            notificationCache.set(key, {
              ...entry,
              notifications: entry.notifications.map((n) => ({
                ...n,
                read: true,
              })),
            });
          }
        });
        return updated;
      });
      toast.success("All notifications marked as read");
    }).finally(() => {
      setIsPending(false);
    });
  };

  const loadMore: (
    offset?: number,
    typeFilter?: NotificationType | "all"
  ) => Promise<CustomNotification[]> = useCallback(
    async (offset?: number, typeFilter?: NotificationType | "all") => {
      if (!username || !offset) return [];
      const history = await sdsApi.getNotifications(
        username,
        typeFilter,
        LIMIT,
        offset
      );
      const parsed = parseNotifications(history, username);
      const more = parsed.length === LIMIT;
      const cacheKey = getCacheKey(typeFilter || "all");

      setNotifications((prev) => {
        const updated = [...prev, ...parsed];
        notificationCache.set(cacheKey, {
          notifications: updated,
          hasMore: more,
        });
        return updated;
      });
      setHasMore(more);

      return parsed;
    },
    [username, getCacheKey]
  );

  return {
    notifications,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    loadMore,
    isPending,
    hasMore,
  };
};
