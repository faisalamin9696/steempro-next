"use client";

import InfiniteList from "@/components/InfiniteList";
import CommunityItem from "@/components/community/CommunityItem";
import CommunitySkeleton from "@/components/skeleton/CommunitySkeleton";
import { useMemo, useState } from "react";
import { Checkbox, Input } from "@heroui/react";
import { Search } from "lucide-react";
import { useAppSelector } from "@/hooks/redux/store";

function CommunitiesPage({
  data,
  account,
}: {
  data: Community[];
  account?: string;
}) {
  const loginData = useAppSelector((s) => s.loginReducer.value);
  const [search, setSearch] = useState("");
  const [onlySubscribed, setOnlySubscribed] = useState(false);

  const filteredData = useMemo(() => {
    if (onlySubscribed) {
      return data.filter((c) => c.observer_subscribed === 1);
    }
    return data;
  }, [data, onlySubscribed]);

  const filterCommunities = (community: Community, term: string) => {
    const query = term.toLowerCase();

    return (
      community.title.toLowerCase().includes(query) ||
      community.account.toLowerCase().includes(query)
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 items-end">
        <Input
          placeholder="Search by title or account..."
          value={search}
          onValueChange={setSearch}
          startContent={<Search size={18} className="text-muted" />}
          variant="flat"
          size="lg"
          radius="lg"
          classNames={{
            inputWrapper: "bg-default-100/50 hover:bg-default-200/50",
          }}
          isClearable
        />

        {!account && loginData?.name && (
          <Checkbox
            isSelected={onlySubscribed}
            onValueChange={setOnlySubscribed}
            classNames={{
              label: "text-small text-muted font-medium",
            }}
          >
            Show only subscribed communities
          </Checkbox>
        )}
      </div>

      <InfiniteList
        data={filteredData}
        renderItem={(community: Community) => (
          <CommunityItem
            account={account}
            key={community.account}
            community={community}
          />
        )}
        Skeleton={CommunitySkeleton}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6"
        searchTerm={search}
        filterFn={filterCommunities}
        enableClientPagination
        clientItemsPerPage={20}
        
      />
    </div>
  );
}

export default CommunitiesPage;
