"use client";

import React, { useState } from "react";
import SAvatar from "@/components/SAvatar";
import TableWrapper from "./wrappers/TableWrapper";
import SLink from "./SLink";

export default function WitnessVotesCard({
  witnesses,
}: {
  witnesses: string[];
}) {
  const [allRows, setAllRows] = useState(
    witnesses.map((item) => ({
      username: item,
    }))
  );

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
            <SLink className="hover:text-blue-500" href={`/@${row.username}`}>
              {row.username}
            </SLink>
          </div>
        );
      }}
    />
  );
}
