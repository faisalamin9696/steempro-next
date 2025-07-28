"use client";

import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { fetchSds, useAppSelector } from "@/constants/AppFunctions";
import LoadingCard from "@/components/LoadingCard";
import CommunityCard from "@/components/community/components/CommunityCard";
import SubscribeButton from "@/components/SubscribeButton";
import STable from "@/components/ui/STable";
import { Switch } from "@heroui/switch";
import { FaUsersLine } from "react-icons/fa6";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown";
import { Button } from "@heroui/button";
import { IoFilterOutline } from "react-icons/io5";
import { sortByKey } from "@/utils/helper";
import { capitalize } from "@/constants/AppConstants";

const statusOptions = [
  { name: "Rank", uid: "rank" },
  { name: "Subscribers", uid: "count_subs" },
  { name: "New", uid: "created" },
];

export default function CommunitiesPage() {
  const loginInfo = useAppSelector((state) => state.loginReducer.value);

  const URL = `/communities_api/getCommunitiesByRank/${
    loginInfo.name || null
  }/500`;

  const { data, isLoading } = useSWR(URL, fetchSds<Community[]>);
  const [allRows, setAllRows] = useState<Community[]>([]);
  const [filterCommunities, setFilterCommunities] = useState(false);
  const filteredCommunities = filterCommunities
    ? allRows.filter((w) => w.observer_subscribed === 1)
    : allRows;

  const [sortBY, setSortBy] = React.useState<"rank" | "count_subs" | "created">(
    "rank"
  );

  const filteredItems = React.useMemo(() => {
    let sortedItems = [...filteredCommunities];

    // Apply sorting
    sortedItems = sortByKey(
      sortedItems,
      sortBY,
      ["created", "count_subs"].includes(sortBY) ? "desc" : "asc"
    );

    return sortedItems;
  }, [filteredCommunities, sortBY]);

  useEffect(() => {
    if (data) setAllRows(data);
  }, [data]);

  if (isLoading) return <LoadingCard />;

  const totalSubs = allRows.filter((d) => d.observer_subscribed === 1).length;

  return (
    <div className="flex flex-col gap-4 pb-10">
      <div className="flex flex-col items-center sm:items-start gap-2 text-center">
        <p className="text-xl font-bold sm:text-3xl">Communities</p>
        <p className="text-sm text-default-500 text-center sm:text-start">
          Connect, discuss, and collaborate on SteemPro! Explore communities
          from tech, lifestyle, crypto to gaming, share ideas, and grow with
          like-minded people. Join the conversation today!
        </p>
      </div>
      <STable
        titleIcon={FaUsersLine}
        filterByValue={["title", "account"]}
        data={filteredItems || []}
        titleClassName="w-full"
        title={
          <div className="flex flex-row items-center justify-between w-full">
            <p>Explore & Engage</p>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  size="sm"
                  variant="flat"
                  startContent={<IoFilterOutline size={18} />}
                  className="font-semibold text-small"
                >
                  {statusOptions?.find((s) => s.uid === sortBY)?.name}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={true}
                selectedKeys={sortBY}
                selectionMode="single"
                onSelectionChange={(item) =>
                  setSortBy(item.currentKey?.toString() as any)
                }
              >
                {statusOptions.map((status) => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {capitalize(status.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        }
        titleExtra={
          <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-row gap-4 items-center">
              <div className="flex items-center space-x-2">
                <Switch
                  size="sm"
                  id="filter-votes"
                  isSelected={filterCommunities}
                  onValueChange={setFilterCommunities}
                >
                  <p className="text-sm">Show only my subscriptions</p>
                </Switch>
              </div>
              {
                <div className="text-sm text-default-500">
                  {loginInfo?.name
                    ? `Subscribed: ${totalSubs}`
                    : "Login to see your subscriptions"}
                </div>
              }
            </div>
          </div>
        }
        tableRow={(community: Community) => (
          <CommunityCard
            community={community}
            className="!bg-transparent shadow-none px-2 py-0"
            endContent={
              <div className="flex gap-1 items-center">
                <SubscribeButton size="sm" community={community} />
              </div>
            }
          />
        )}
      />
    </div>
  );
}
