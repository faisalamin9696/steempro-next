"use client";

import React, { useEffect, useState } from "react";

import useSWR from "swr";
import { fetchSds } from "@/libs/constants/AppFunctions";
import SAvatar from "@/components/SAvatar";
import TimeAgoWrapper from "@/components/wrappers/TimeAgoWrapper";
import LoadingCard from "@/components/LoadingCard";
import SLink from "./SLink";
import TableWrapper from "./wrappers/TableWrapper";

const INITIAL_VISIBLE_COLUMNS = ["voter", "rshares", "time"];

const columns = [
  { name: "VOTER", uid: "voter", sortable: true },
  { name: "VALUE", uid: "rshares", sortable: true },
  { name: "TIME", uid: "time", sortable: true },
];

export default function VotersCard({ comment }: { comment: Feed | Post }) {
  const URL = `/posts_api/getVotesById/${comment.link_id}`;

  if (!comment.link_id) return null;

  const { data, isLoading } = useSWR(URL, fetchSds<PostVote[]>);
  const [allRows, setAllRows] = useState<PostVote[]>([]);

  useEffect(() => {
    if (data) setAllRows(data);
  }, [data]);

  const [filterValue, setFilterValue] = React.useState<any>("");

  const filteredItems = React.useMemo(() => {
    let filteredVotes = [...allRows];

    filteredVotes = filteredVotes.filter((votes) =>
      votes.voter.toLowerCase().includes(filterValue.toLowerCase())
    );

    return filteredVotes;
  }, [allRows, filterValue]);

  const renderCell = React.useCallback((votes: PostVote, columnKey) => {
    const cellValue = votes[columnKey];

    switch (columnKey) {
      case "voter":
        return (
          <div className="flex flex-row items-start gap-1">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 items-center">
                <SAvatar size="xs" username={votes.voter} />
                <SLink
                  className=" hover:text-blue-500"
                  href={`/@${votes.voter}`}
                >
                  {votes.voter}
                </SLink>
              </div>
            </div>
          </div>
        );

      case "rshares":
        const ratio = (comment?.payout ?? 1) / (comment?.net_rshares ?? 1);
        const voteAmount = votes.rshares * ratio;

        return (
          <div className="flex flex-col">
            <p className="text-bold text-small capitalize">
              ${voteAmount.toLocaleString()}
            </p>
            <p className="text-bold text-small capitalize">
              {votes.percent / 100}%
            </p>
          </div>
        );

      case "time":
        return (
          <TimeAgoWrapper
            className="text-bold text-default-600"
            created={votes.time * 1000}
          />
        );

      default:
        return cellValue;
    }
  }, [comment]);

  if (isLoading) return <LoadingCard />;

  return (
    <TableWrapper
      initialVisibleColumns={INITIAL_VISIBLE_COLUMNS}
      tableColumns={columns}
      filteredItems={filteredItems}
      onFilterValueChange={setFilterValue}
      renderCell={renderCell}
      baseVarient
      hidePaginationActions
    />
  );
}
