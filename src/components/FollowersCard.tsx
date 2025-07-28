"use client";

import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { fetchSds } from "@/constants/AppFunctions";
import SAvatar from "@/components/ui/SAvatar";
import SLink from "./ui/SLink";
import STable from "./ui/STable";
import { useDeviceInfo } from "@/hooks/useDeviceInfo";
import { capitalize } from "@/constants/AppConstants";
import { Button } from "@heroui/button";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { IoFilterOutline } from "react-icons/io5";
import { sortByKey } from "@/utils/helper";

const sortOptions = [
  { name: "A → Z", uid: "asc" },
  { name: "Z → A", uid: "desc" },
];

export default function FollowersCard({
  username,
  isFollowing,
  title,
}: {
  username: string;
  isFollowing?: boolean;
  title?: string;
}) {
  const URL = `/followers_api/get${
    isFollowing ? "Following" : "Followers"
  }/${username}/100000`;

  if (!username) return null;

  const { data, isLoading } = useSWR(URL, fetchSds<string[]>);
  const [allRows, setAllRows] = useState<{ username: string }[]>([]);
  const { isMobile } = useDeviceInfo();
  const [sortBY, setSortBy] = React.useState<"asc" | "desc">("asc");

  const filteredItems = React.useMemo(() => {
    let sortedItems = [...allRows];

    // Apply sorting
    sortedItems = sortByKey(sortedItems, "username", sortBY);

    return sortedItems;
  }, [allRows, sortBY]);

  useEffect(() => {
    if (data) {
      const mappedData = data.map((item) => ({
        username: item,
      }));

      setAllRows(mappedData);
    }
  }, [data]);

  return (
    <div>
      <STable
        stickyHeader={!isMobile}
        itemsPerPage={20}
        data={filteredItems || []}
        isLoading={isLoading}
        titleClassName="w-full"
        title={
          <div className="flex flex-row items-center justify-between w-full">
            <p>{title ?? "Followers"}</p>

            <Dropdown>
              <DropdownTrigger>
                <Button
                  size="sm"
                  variant="flat"
                  startContent={<IoFilterOutline size={18} />}
                  className="font-semibold text-small"
                >
                  {sortOptions?.find((s) => s.uid === sortBY)?.name}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={true}
                selectedKeys={[sortBY]}
                selectionMode="single"
                onSelectionChange={(item) =>
                  setSortBy(item.currentKey?.toString() as any)
                }
              >
                {sortOptions.map((status) => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {capitalize(status.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        }
        filterByValue={["username"]}
        tableRow={(item) => (
          <div className="flex gap-2 items-center" key={item.username}>
            <SAvatar size="1xs" username={item.username} />
            <SLink
              className="hover:text-blue-500 text-sm"
              href={`/@${item.username}`}
            >
              {item.username}
            </SLink>
          </div>
        )}
        
      />
    </div>
  );
}
