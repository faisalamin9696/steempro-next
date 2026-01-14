import { ModalProps } from "@heroui/react";
import SModal from "../ui/SModal";
import { ColumnDef, DataTable } from "../ui/data-table";
import SUsername from "../ui/SUsername";
import SAvatar from "../ui/SAvatar";
import LoadingStatus from "../LoadingStatus";
import { useSdsList } from "@/hooks/sds-client-hooks";
import { useMemo } from "react";

interface BaseProps extends Pick<ModalProps, "isOpen" | "onOpenChange"> {
  title?: string;
}

type UnifiedUsersModalProps = BaseProps &
  (
    | {
        data: string[];
        username?: string;
        fetchType?: "followers" | "following";
      }
    | {
        data?: never;
        username: string;
        fetchType: "followers" | "following";
      }
  );

export default function UnifiedUsersModal({
  isOpen,
  onOpenChange,
  data,
  username,
  fetchType,
  title,
}: UnifiedUsersModalProps) {
  /** ------------------------------
   *  1. Auto-fetch followers/following if fetchType is used and data is missing
   * ------------------------------ */

  const shouldFetch = !data || (!!fetchType && !!username);

  const {
    data: followsData,
    error,
    isLoading,
  } = useSdsList<string>(
    shouldFetch
      ? fetchType === "following"
        ? `/followers_api/getFollowing/${username}`
        : `/followers_api/getFollowers/${username}`
      : null
  );

  /** ------------------------------
   *  2. Build data source
   * ------------------------------ */
  const finalUsernames = data?.length ? data : followsData ?? [];
  const mappedData = useMemo(
    () => finalUsernames.map((item) => ({ username: item })),
    [finalUsernames]
  );

  /** ------------------------------
   *  3. Table Columns
   * ------------------------------ */
  const columns: ColumnDef<{ username: string }>[] = [
    {
      key: "username",
      header: "Username",
      sortable: true,
      searchable: true,
      render(value) {
        return (
          <div className="flex flex-row gap-2 items-center">
            <SAvatar size="sm" username={value} />
            <SUsername username={value} />
          </div>
        );
      },
    },
  ];

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
            searchPlaceholder="Search by username..."
            columns={columns}
            data={mappedData}
          />
        );
      }}
    </SModal>
  );
}
