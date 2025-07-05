"use client";

import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { fetchSds } from "@/constants/AppFunctions";
import SAvatar from "@/components/ui/SAvatar";
import TableWrapper from "./wrappers/TableWrapper";
import SLink from "./ui/SLink";

export default function FollowersCard({
  username,
  isFollowing,
}: {
  username: string;
  isFollowing?: boolean;
}) {
  const URL = `/followers_api/get${
    isFollowing ? "Following" : "Followers"
  }/${username}/100000`;

  if (!username) return null;

  const { data, isLoading } = useSWR(URL, fetchSds<string[]>);
  const [allRows, setAllRows] = useState<{ username: string }[]>([]);

  useEffect(() => {
    if (data) {
      const mappedData = data.map((item) => ({
        username: item,
      }));

      setAllRows(mappedData);
    }
  }, [data]);

  const [filterValue, setFilterValue] = React.useState<string>("");
  const hasSearchFilter = Boolean(filterValue);

  const filteredItems = React.useMemo(() => {
    let filteredFollowers = [...allRows];

    if (hasSearchFilter) {
      filteredFollowers = filteredFollowers.filter((item) =>
        item.username.toLowerCase().includes(filterValue.toLowerCase().trim())
      );
    }

    return filteredFollowers;
  }, [allRows, filterValue]);

  return (
    <TableWrapper
      isLoading={isLoading}
      topContentDropdown={<></>}
      baseVarient
      hidePaginationActions
      inputClassName="!max-w-[75%]"
      sortDescriptor={{ column: "username", direction: "ascending" }}
      initialVisibleColumns={["username"]}
      tableColumns={[{ name: "USERNAME", uid: "username", sortable: true }]}
      filteredItems={filteredItems}
      onFilterValueChange={setFilterValue}
      renderCell={(row) => {
        return (
          <div className="flex gap-2 items-center p-2" key={row.username}>
            <SAvatar size="xs" username={row.username} />
            <SLink className="hover:text-blue-500" href={`/@${row.username}`}>{row.username}</SLink>
          </div>
        );
      }}
    />
  );
}
