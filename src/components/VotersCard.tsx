"use client";

import React, { useEffect, useState } from "react";

import useSWR from "swr";
import { fetchSds } from "@/constants/AppFunctions";
import SAvatar from "@/components/ui/SAvatar";
import TimeAgoWrapper from "@/components/wrappers/TimeAgoWrapper";
import LoadingCard from "@/components/LoadingCard";
import SLink from "./ui/SLink";
import STable from "./ui/STable";
import { Chip } from "@heroui/chip";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown";
import { Button } from "@heroui/button";
import { capitalize } from "@/constants/AppConstants";
import { sortByKey } from "@/utils/helper";
import { IoFilterOutline } from "react-icons/io5";
import { useDeviceInfo } from "@/hooks/useDeviceInfo";

const sortOptions = [
  { name: "Vote value", uid: "rshares" },
  { name: "Username", uid: "voter" },
  { name: "New", uid: "time" },
];

export default function VotersCard({
  comment,
  isOpen,
}: {
  comment: Feed | Post;
  isOpen: boolean;
}) {
  const URL = `/posts_api/getVotesById/${comment.link_id}`;

  if (!comment.link_id) return null;

  const { data, isLoading } = useSWR(isOpen ? URL : null, fetchSds<PostVote[]>);
  const [allRows, setAllRows] = useState<PostVote[]>([]);
  const { isMobile } = useDeviceInfo();

  useEffect(() => {
    if (data) setAllRows(data);
  }, [data]);

  const [sortBY, setSortBy] = React.useState<"rshares" | "voter" | "time">(
    "rshares"
  );

  const filteredItems = React.useMemo(() => {
    let sortedItems = [...allRows];

    // Apply sorting
    sortedItems = sortByKey(
      sortedItems,
      sortBY,
      ["rshares", "time"].includes(sortBY) ? "desc" : "asc"
    );

    return sortedItems;
  }, [allRows, sortBY]);

  if (isLoading) return <LoadingCard />;

  return (
    <div>
      <STable
        stickyHeader={!isMobile}
        filterByValue={"voter"}
        title={
          <div className="flex flex-row items-center justify-between w-full">
            <p>Voters</p>

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
        data={filteredItems}
        itemsPerPage={20}
        titleClassName="pb-4 w-full"
        tableRow={(votes) => {
          const ratio = (comment?.payout ?? 1) / (comment?.net_rshares ?? 1);
          const voteAmount = (votes.rshares * ratio)?.toLocaleString();

          return (
            <div className="flex gap-2 items-start">
              <SAvatar size="1xs" username={votes.voter} />

              <div className=" flex flex-col gap-2">
                <div className="flex flex-row gap-2">
                  <SLink
                    className=" hover:text-blue-500"
                    href={`/@${votes.voter}`}
                  >
                    {votes.voter}
                  </SLink>

                  <Chip
                    className="capitalize border-none gap-1 text-default-600"
                    color={"success"}
                    size="sm"
                    variant="flat"
                  >
                    ${voteAmount}
                  </Chip>
                </div>

                <div className="flex flex-row gap-2">
                  <TimeAgoWrapper
                    className="text-bold text-default-600"
                    created={votes.time * 1000}
                  />
                  •
                  <p className="text-bold text-xs capitalize">
                    {votes.percent / 100}%
                  </p>
                </div>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
