import EmptyList from "@/components/EmptyList";
import ErrorCard from "@/components/ErrorCard";
import LoadingCard from "@/components/LoadingCard";
import { fetchSds } from "@/libs/constants/AppFunctions";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { ScrollShadow } from "@heroui/scroll-shadow";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { twMerge } from "tailwind-merge";
import CommunityActivityItem from "./components/CommunityActivityItem";
import InfiniteScroll from "react-infinite-scroll-component";
import clsx from "clsx";
import { AsyncUtils } from "@/libs/utils/async.utils";

export function CommunityActivities({ community }: { community: Community }) {
  const [query, setQuery] = useState("");
  const [filteredData, setFilteredData] = useState<CommunityLog[]>();
  const URL = `/communities_api/getCommunityActivityLogs/${community.account}/1000`;
  const { data, isLoading, error, isValidating } = useSWR(
    URL,
    fetchSds<CommunityLog[]>
  );
  const [limit, setLimit] = useState(30);

  useEffect(() => {
    let timeout;
    if (data) {
      timeout = setTimeout(() => {
        setFilteredData(
          data.filter(
            (log) =>
              log.account?.toLowerCase().includes(query.toLowerCase()) ||
              log.type?.toLowerCase().includes(query.toLowerCase()) ||
              log.data?.toLowerCase().includes(query.toLowerCase())
          )
        );
      }, 500);
    }
    return () => clearTimeout(timeout);
  }, [query, data]);

  async function handleEndReached() {
    if (data) {
      await AsyncUtils.sleep(2.5);
      setLimit((prevLimit) => prevLimit + 30);
    }
  }

  function ListLoader(): JSX.Element {
    return (
      <div className="md:absolute md:bottom-0 flex justify-center items-center md:w-full">
        <Button
          color="default"
          variant="light"
          className="self-center"
          isIconOnly
          isLoading={true}
          isDisabled
        ></Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 max-h-[500px] pb-10 overflow-auto">
      <div className={twMerge("gap-2", "sticky top-0 z-10 backdrop-blur-sm")}>
        <div className="flex flex-row gap-2 items-center p-1">
          <Input
            variant="flat"
            size="sm"
            isClearable
            value={query}
            inputMode="search"
            onValueChange={setQuery}
            placeholder={"Search..."}
            autoCapitalize="off"
          />
        </div>
      </div>

      {isLoading || isValidating ? (
        <LoadingCard />
      ) : error ? (
        <ErrorCard message={error.message} />
      ) : !data?.length ? (
        <EmptyList />
      ) : (
        <ScrollShadow className="flex flex-col gap-2" id="scrollDiv2">
          <InfiniteScroll
            className={clsx("flex flex-col gap-4 md:pb-16")}
            dataLength={limit}
            next={handleEndReached}
            hasMore={limit < (data?.length ?? 0)}
            loader={<ListLoader />}
            scrollableTarget="scrollDiv2"
            endMessage={
              !isLoading && (
                <EmptyList text={data ? undefined : "Search anything"} />
              )
            }
          >
            {filteredData?.slice(0, limit)?.map((log) => {
              return <CommunityActivityItem communityLog={log} />;
            })}
          </InfiniteScroll>
        </ScrollShadow>
      )}
    </div>
  );
}
