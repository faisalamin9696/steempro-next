"use client";

import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { fetchSds } from "@/constants/AppFunctions";
import SAvatar from "@/components/ui/SAvatar";
import SLink from "./ui/SLink";
import { useTranslation } from "@/utils/i18n";
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

const getSortOptions = (t: any) => [
  { name: t("common.a_to_z"), uid: "asc" },
  { name: t("common.z_to_a"), uid: "desc" },
];

export default function WitnessVotesCard({ account }: { account: AccountExt }) {
  const witnesses = account.witness_votes || [];
  const [allRows, setAllRows] = useState<{ username: string }[]>([]);
  const { isMobile } = useDeviceInfo();
  const { t } = useTranslation();
  const [sortBY, setSortBy] = React.useState<"asc" | "desc">("asc");
  const sortOptions = getSortOptions(t);

  const filteredItems = React.useMemo(() => {
    let sortedItems = [...allRows];

    // Apply sorting
    sortedItems = sortByKey(sortedItems, "username", sortBY);

    return sortedItems;
  }, [allRows, sortBY]);

  useEffect(() => {
    if (witnesses) {
      const mappedData = witnesses.map((item) => ({
        username: item,
      }));

      setAllRows(mappedData);
    }
  }, [witnesses]);

  return (
    <div>
      <STable
        stickyHeader={!isMobile}
        itemsPerPage={15}
        data={filteredItems || []}
        titleClassName="w-full"
        title={
          <div className="flex flex-row items-center justify-between w-full">
            <p>{t("witnesses.witness_votes")}</p>

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
        description={t("witnesses.votes_remaining_description", {
          account: account.name,
          remaining: 30 - (account?.witness_votes?.length || 0)
        })}
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
