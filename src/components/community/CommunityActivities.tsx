import EmptyList from "@/components/EmptyList";
import ErrorCard from "@/components/ErrorCard";
import LoadingCard from "@/components/LoadingCard";
import { awaitTimeout, fetchSds } from "@/libs/constants/AppFunctions";
import { Button, Card, Input, ScrollShadow } from "@nextui-org/react";
import React, { useEffect, useMemo, useState } from "react";
import { FaSearch } from "react-icons/fa";
import useSWR from "swr";
import { twMerge } from "tailwind-merge";
import CommunityActivityItem from "./components/CommunityActivityItem";
import InfiniteScroll from "react-infinite-scroll-component";
import clsx from "clsx";

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
      await awaitTimeout(2.5);
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
            startContent={<FaSearch className=" text-default-600" />}
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
            className={clsx("relative grid grid-cols-1 gap-4  p-2 md:pb-16")}
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
            <div
              className={twMerge("grid grid-cols-1 gap-4", "md:grid-cols-2")}
            >
              {filteredData?.slice(0, limit)?.map((log) => {
                return (
                  <Card className="border compact border-gray-100/10 shadow-md shadow-gray-400 dark:shadow-default-500 bg-transparent backdrop-blur-md">
                    <CommunityActivityItem communityLog={log} />
                  </Card>
                );
              })}
            </div>
          </InfiniteScroll>
        </ScrollShadow>
      )}
    </div>
  );
}
