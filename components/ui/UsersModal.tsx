import { ModalProps } from "@heroui/modal";
import SModal from "../ui/SModal";
import { ColumnDef, DataTable } from "../ui/data-table";
import SUsername from "../ui/SUsername";
import SAvatar from "../ui/SAvatar";
import LoadingStatus from "../LoadingStatus";
import { useSdsList } from "@/hooks/sds-client-hooks";
import { useMemo } from "react";

interface BaseProps<T extends Record<string, any>>
  extends Pick<ModalProps, "isOpen" | "onOpenChange"> {
  title?: string;
  columns?: ColumnDef<T>[];
  renderUser?: (username: string, item: T) => React.ReactNode;
}

type UnifiedUsersModalProps<T extends Record<string, any>> = BaseProps<T> &
  (
    | {
        data: (T | string)[];
        username?: string;
        fetchType?: "followers" | "following" | "subscribers";
      }
    | {
        data?: never;
        username: string;
        fetchType: "followers" | "following" | "subscribers";
      }
  );

export default function UnifiedUsersModal<
  T extends Record<string, any> = { username: string }
>({
  isOpen,
  onOpenChange,
  data,
  username,
  fetchType,
  title,
  columns,
  renderUser,
}: UnifiedUsersModalProps<T>) {
  /** ------------------------------
   *  1. Auto-fetch followers/following/subscribers if fetchType is used and data is missing
   * ------------------------------ */

  const shouldFetch = !data || (!!fetchType && !!username);

  const {
    data: followsData,
    error,
    isLoading,
  } = useSdsList<string>(
    shouldFetch
      ? fetchType === "subscribers"
        ? `/communities_api/getCommunitySubscribers/${username}`
        : fetchType === "following"
        ? `/followers_api/getFollowing/${username}`
        : `/followers_api/getFollowers/${username}`
      : null
  );

  /** ------------------------------
   *  2. Build data source
   * ------------------------------ */
  const mappedData = useMemo(() => {
    const rawData = (data?.length ? data : (followsData as any) ?? []) as (
      | string
      | T
    )[];
    return rawData.map((item) => {
      if (typeof item === "string") {
        return { username: item } as unknown as T;
      }
      return item as T;
    });
  }, [data, followsData]);

  /** ------------------------------
   *  3. Table Columns
   * ------------------------------ */
  const finalColumns = useMemo(() => {
    if (columns && !shouldFetch) return columns;
    return [
      {
        key: "username",
        header: "Username",
        sortable: true,
        searchable: true,
        render(value, row) {
          if (renderUser) return renderUser(value, row);
          return (
            <div className="flex flex-row gap-2 items-center">
              <SAvatar size="sm" username={value} />
              <SUsername username={value} />
            </div>
          );
        },
      } as ColumnDef<T>,
    ];
  }, [columns, renderUser]);

  /** ------------------------------
   *  4. Title Logic
   * ------------------------------ */
  const modalTitle = useMemo(() => {
    if (title) return title;
    switch (fetchType) {
      case "followers":
        return "Followers";
      case "following":
        return "Following";
      default:
        return "Accounts";
    }
  }, [title, fetchType]);

  return (
    <SModal
      scrollBehavior="inside"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={() => (
        <div className="flex flex-row gap-2 items-center">
          <p>{modalTitle}</p>
          <p className="text-sm text-muted">({mappedData.length})</p>
        </div>
      )}
    >
      {() => {
        if (shouldFetch && (isLoading || !followsData)) {
          return <LoadingStatus />;
        }
        if (shouldFetch && error) {
          return (
            <div className="text-danger p-4 text-center">
              Failed to fetch data.
            </div>
          );
        }
        return (
          <DataTable
            searchPlaceholder="Search..."
            columns={finalColumns}
            data={mappedData}
          />
        );
      }}
    </SModal>
  );
}
