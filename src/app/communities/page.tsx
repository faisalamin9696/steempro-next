"use client";

import React, { useEffect, useState } from "react";

import useSWR from "swr";
import { fetchSds, useAppSelector } from "@/libs/constants/AppFunctions";
import LoadingCard from "@/components/LoadingCard";
import CommunityCard from "@/components/community/components/CommunityCard";
import { getTimeFromNow } from "@/libs/helper/time";
import SubscribeButton from "@/components/SubscribeButton";
import TableWrapper from "@/components/wrappers/TableWrapper";

const INITIAL_VISIBLE_COLUMNS = ["community", "count_subs", "count_pending"];

const columns = [
  { name: "RANK", uid: "rank", sortable: true },
  { name: "COMMUNITY", uid: "community", sortable: false },
  { name: "SUBSCRIBERS", uid: "count_subs", sortable: true },
  { name: "REWARD", uid: "count_pending", sortable: true },
  { name: "CREATED", uid: "created", sortable: true },
];

export default function CommunitiesPage() {
  const loginInfo = useAppSelector((state) => state.loginReducer.value);

  const URL = `/communities_api/getCommunitiesByRank/${
    loginInfo.name || null
  }/1000`;

  const { data, isLoading } = useSWR(URL, fetchSds<Community[]>);
  const [allRows, setAllRows] = useState<Community[]>([]);
  useEffect(() => {
    if (data) setAllRows(data);
  }, [data]);

  const [filterValue, setFilterValue] = React.useState<any>("");
  const hasSearchFilter = Boolean(filterValue);

  const filteredItems = React.useMemo(() => {
    let filteredCommunities = [...allRows];

    if (hasSearchFilter) {
      filteredCommunities = filteredCommunities.filter(
        (community) =>
          community.title.toLowerCase().includes(filterValue.toLowerCase()) ||
          community.account.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    return filteredCommunities;
  }, [allRows, filterValue]);

  const renderCell = React.useCallback((community: Community, columnKey) => {
    const cellValue = community[columnKey];

    switch (columnKey) {
      case "community":
        return (
          <CommunityCard
            compact
            community={community}
            className="bg-transparent dark:bg-transparent shadow-none max-w-[300px]"
            endContent={
              <div className="flex gap-1 items-center">
                <SubscribeButton size="sm" community={community} />
              </div>
            }
          />
        );

      case "count_subs":
        return <p>{community.count_subs.toLocaleString()}</p>;

      case "count_pending":
        return <p>$ {community.count_pending.toLocaleString()}</p>;

      case "created":
        return <p>{getTimeFromNow(community.created * 1000)}</p>;

      default:
        return cellValue;
    }
  }, []);

  if (isLoading) return <LoadingCard />;

  return (
    <div className="flex flex-col gap-4 overflow-hidden p-2">
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-blue-500 text-3xl font-semibold">Communities</p>
        <p className="text-xs opacity-disabled">
          {`Explore & Engage in Communities`}
        </p>
        <p className=" text-center max-w-[80%] opacity-80">
          Connect, discuss, and collaborate on SteemPro! Explore communities
          from tech, lifestyle, crypto to gaming, share ideas, and grow with
          like-minded people. Join the conversation today!
        </p>
      </div>

      <TableWrapper
        filterValue={filterValue}
        initialVisibleColumns={INITIAL_VISIBLE_COLUMNS}
        tableColumns={columns}
        filteredItems={filteredItems}
        onFilterValueChange={setFilterValue}
        renderCell={renderCell}
        sortDescriptor={{ column: "rank", direction: "ascending" }}
        mobileVisibleColumns={['community']}
      />
    </div>
  );
}
