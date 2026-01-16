import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Bell,
  Heart,
  MessageCircle,
  AtSign,
  UserPlus,
  CheckCheck,
  Filter,
  Repeat,
  LinkIcon,
  Link2,
} from "lucide-react";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { useNotifications, CustomNotification } from "@/hooks/useNotifications";
import { Button, Chip, Select, SelectItem } from "@heroui/react";
import moment from "moment";
import Link from "next/link";
import SAvatar from "../ui/SAvatar";
import SCard from "../ui/SCard";
import SUsername from "../ui/SUsername";
import { useAppSelector } from "@/hooks/redux/store";
import { useSteemUtils } from "@/hooks/useSteemUtils";
import { useSession } from "next-auth/react";
import PageHeader from "../ui/PageHeader";

const FALLBACK_ICON = Bell;
const FALLBACK_COLOR = "text-gray-400";

const typeConfig: Record<
  NotificationType,
  { icon: React.ElementType; color: string; label: string }
> = {
  vote: { icon: Heart, color: "text-rose-500", label: "Vote" },
  reply: { icon: MessageCircle, color: "text-blue-500", label: "Reply" },
  mention: { icon: AtSign, color: "text-purple-500", label: "Mention" },
  follow: { icon: UserPlus, color: "text-emerald-500", label: "Follow" },
  resteem: { icon: Repeat, color: "text-amber-500", label: "Resteem" },
} as any;

const NotificationsCard = ({ username }: { username: string }) => {
  const [typeFilter, setTypeFilter] = useState<NotificationType | "all">("all");

  const {
    notifications,
    loading,
    fetchNotifications,
    markAllAsRead,
    loadMore,
    isPending,
    hasMore,
  } = useNotifications(username);

  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const { globalProps } = useSteemUtils();
  const unreadCount = useAppSelector(
    (s) => s.commonReducer.values
  ).unread_notifications_count;
  const { data: session } = useSession();

  const isMe = session?.user?.name === username;

  useEffect(() => {
    fetchNotifications(true, typeFilter);
  }, [username, typeFilter]);

  const getConfig = useCallback(
    (type: NotificationType) =>
      typeConfig[type] ?? {
        icon: FALLBACK_ICON,
        color: FALLBACK_COLOR,
        label: type,
      },
    []
  );

  // Better filtering + sorting (no mutation)
  const filteredNotifications = useMemo(() => {
    if (!notifications || notifications.length === 0) return [];

    let result = notifications;

    // Stable sort using copies
    return [...result].sort((a, b) => {
      const A = new Date(a.timestamp).getTime();
      const B = new Date(b.timestamp).getTime();
      return sortOrder === "newest" ? B - A : A - B;
    });
  }, [notifications, sortOrder]);

  const rewardFactor = useMemo(() => {
    const { recent_reward_claims, total_reward_fund, median_price } =
      globalProps;
    if (!recent_reward_claims || !total_reward_fund) return 0;
    return (total_reward_fund / recent_reward_claims) * median_price;
  }, [globalProps]);

  const columns: ColumnDef<CustomNotification>[] = useMemo(
    () => [
      {
        key: "type",
        header: "Type",
        className: "w-auto",
        render: (_, row) => {
          const config = getConfig(row.type);
          const Icon = config.icon;

          return (
            <div className="flex items-center gap-2 ">
              {!row.read && (
                <div className="h-1.5 w-1.5 bg-secondary rounded-full" />
              )}
              <div className={`p-1.5 rounded-md bg-muted/10 ${config.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-xs text-muted capitalize hidden sm:flex">
                {config.label}
              </span>
            </div>
          );
        },
      },
      {
        key: "from",
        header: "Message",
        render: (value, row) => {
          const user = value || "unknown";
          const amount = rewardFactor * (row?.voted_rshares ?? 0);

          return (
            <div className="flex items-center gap-2">
              <SAvatar size={36} username={user} />
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <SUsername
                    className="font-semibold text-sm"
                    username={`@${user}`}
                  />
                  <p className="text-default-800">
                    {row.message}
                    {row.type === "vote"
                      ? ` $(${amount?.toLocaleString()})`
                      : ""}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Chip
                    className="transition-colors delay-50 hover:text-blue-500"
                    as={Link}
                    href={row.url}
                    size="sm"
                    variant="flat"
                    classNames={{ content: "flex flex-row gap-1 items-center" }}
                  >
                    <Link2 size={16} />
                    {row.url.substring(0, 24).replace("/", "")}...
                  </Chip>
                  <p className="text-xs text-muted">
                    {moment.unix(row.timestamp).fromNow()}
                  </p>
                </div>
              </div>
            </div>
          );
        },
      },
    ],
    [getConfig, rewardFactor]
  );

  return (
    <div className="flex flex-col gap-4">
      {/* HEADER */}

      <PageHeader
        title="Notifications"
        icon={Bell}
        size="sm"
        iconSize={20}
        description={
          isMe
            ? `${unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}`
            : ""
        }
        titleEndContent={
          unreadCount > 0 && (
            <Button
              variant="bordered"
              size="sm"
              onPress={markAllAsRead}
              className="gap-1.5"
              isLoading={isPending}
            >
              {!isPending && <CheckCheck className="h-4 w-4" />}
              <span>Mark all read</span>
            </Button>
          )
        }
      />

      {/* MAIN CARD */}
      <SCard className="p-0 card" classNames={{ header: "p-0", body: "gap-4" }}>
        {/* FILTERS */}
        <div className="flex flex-col 1xs:flex-row 1xs:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted" />
            Filter & Sort
          </div>

          <div className="flex flex-wrap gap-2 self-end">
            {/* TYPE FILTER */}
            <Select
              className="w-[120px]"
              selectedKeys={[typeFilter]}
              onSelectionChange={(keys) =>
                setTypeFilter([...keys][0] as NotificationType | "all")
              }
              selectionMode="single"
              disallowEmptySelection
              defaultSelectedKeys={["all"]}
              variant="faded"
            >
              <SelectItem key="all">All types</SelectItem>
              {
                Object.entries(typeConfig).map(([type, config]) => (
                  <SelectItem key={type} textValue={config.label}>
                    <div className="flex items-center gap-2">
                      <config.icon className={`h-3.5 w-3.5 ${config.color}`} />
                      <span>{config.label}</span>
                    </div>
                  </SelectItem>
                )) as any
              }
            </Select>

            {/* SORT ORDER */}
            <Select
              defaultSelectedKeys={["newest"]}
              className="w-[120px]"
              selectedKeys={[sortOrder]}
              onSelectionChange={(keys) =>
                setSortOrder([...keys][0] as "newest" | "oldest")
              }
              selectionMode="single"
              disallowEmptySelection
              variant="faded"
            >
              <SelectItem key="newest">Newest</SelectItem>
              <SelectItem key="oldest">Oldest</SelectItem>
            </Select>
          </div>
        </div>
        {/* TABLE */}
        <DataTable
          data={filteredNotifications}
          loadMore={(offset) => loadMore(offset, typeFilter)}
          hasMore={() => hasMore}
          columns={columns}
          searchPlaceholder="Search by user or activity..."
          emptyMessage={
            loading ? "Loading notifications..." : "No notifications found"
          }
          initialLoadCount={Math.max(notifications.length, 50)}
          loadMoreCount={50}
          onLoadedMore={() => {}}
        />
      </SCard>
    </div>
  );
};

export default NotificationsCard;
