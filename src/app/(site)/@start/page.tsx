"use client";

import CommunityCard from "@/components/community/components/CommunityCard";
import ErrorCard from "@/components/ErrorCard";
import LoadingCard from "@/components/LoadingCard";
import { fetchSds, useAppSelector } from "@/libs/constants/AppFunctions";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { Button } from "@heroui/button";
import { GrAnnounce } from "react-icons/gr";
import useSWR from "swr";
import { HiMiniUserGroup } from "react-icons/hi2";
import React, { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import EmptyList from "@/components/EmptyList";
import { Accordion, AccordionItem } from "@heroui/accordion";
import SLink from "@/components/SLink";
import { AsyncUtils } from "@/libs/utils/async.utils";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function HomeStart() {
  const { data, error, mutate, isLoading, isValidating } = useSWR(
    "/api/steem/announcement",
    fetcher
  );

  const loginInfo = useAppSelector((state) => state.loginReducer.value);

  const URL = `/communities_api/getCommunitiesByRank/${
    loginInfo.name || null
  }/50`;
  let {
    data: allCommunities,
    isLoading: isCommunitiesLoading,
    error: communitiesError,
    mutate: mutateCommunities,
  } = useSWR(URL, fetchSds<Community[]>);

  const [query, setQuery] = useState("");
  const [filteredData, setFilteredData] = useState<Community[]>([]);
  const [rows, setRows] = useState<Community[]>(allCommunities ?? []);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (rows) {
        setFilteredData(
          rows.filter(
            (community) =>
              community.account.includes(query.toLowerCase()) ||
              community.title.includes(query.toLowerCase())
          )
        );
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [query, rows]);

  useEffect(() => {
    if (allCommunities) {
      setRows(allCommunities.slice(0, 20));
    }
  }, [allCommunities]);

  function loadMoreRows(mainData: Community[], rowsData: Community[]) {
    let newStart = mainData?.slice(rowsData?.length ?? 0);
    const newRow = newStart?.slice(0, 20);
    return newRow ?? [];
  }

  async function handleEndReached() {
    if (allCommunities) {
      setLoadingMore(true);
      await AsyncUtils.sleep(2.5);
      const newRows = loadMoreRows(allCommunities, rows);
      setRows([...rows, ...newRows!]);
      setLoadingMore(false);
    }
  }

  function ListLoader(): React.ReactNode {
    return (
      <div className="flex justify-center items-center">
        <Button
          color="default"
          variant="light"
          className="self-center"
          isIconOnly
          isLoading={loadingMore}
          isDisabled
          onPress={handleEndReached}
        ></Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-lg gap-4">
      <Accordion defaultExpandedKeys={["announcements"]} isCompact>
        <AccordionItem
          startContent={<GrAnnounce className="text-primary text-xl" />}
          key="announcements"
          aria-label="posts"
          title={
            <div className="flex items-center gap-2 ">
              <p className="text-medium font-semibold">{"Announcements"}</p>
            </div>
          }
        >
          {isLoading || isValidating ? (
            <LoadingCard />
          ) : error ? (
            <ErrorCard message={error?.message} onPress={mutate} />
          ) : (
            <div className="flex flex-col gap-4">
              {error
                ? null
                : data?.map?.((annoucement, index) => {
                    return (
                      <div
                        key={index ?? annoucement.authPerm}
                        className="bg-white rounded-lg dark:bg-white/5 text-sm px-2 py-1"
                      >
                        <SLink
                          className=" text-blue-400 hover:underline font-semibold"
                          href={`/@${annoucement.authPerm}`}
                        >
                          {annoucement.title}
                        </SLink>
                        <p className="opacity-75 text-sm line-clamp-3 font-normal">
                          {annoucement.description}
                        </p>
                      </div>
                    );
                  })}
            </div>
          )}
        </AccordionItem>
      </Accordion>

      <Accordion defaultExpandedKeys={["communities"]} isCompact>
        <AccordionItem
          startContent={<HiMiniUserGroup className="text-primary text-xl" />}
          key="communities"
          aria-label="posts"
          title={
            <div className="flex items-center gap-2 ">
              <SLink
                className="text-medium font-semibold"
                href={"/communities"}
              >
                {"Top Communities"}
              </SLink>
            </div>
          }
        >
          {isCommunitiesLoading ? (
            <LoadingCard />
          ) : communitiesError ? (
            <ErrorCard
              message={communitiesError?.message}
              onPress={mutateCommunities}
            />
          ) : (
            <ScrollShadow
              id="scrollableDiv"
              style={{
                height: 420,
                overflow: "auto",
                display: "flex",
                flexDirection: "column",
              }}
              className="flex flex-col gap-4 scrollbar-thin mb-20"
            >
              <InfiniteScroll
                className="gap-2  px-[1px] pb-1"
                dataLength={filteredData?.length}
                next={handleEndReached}
                hasMore={filteredData?.length < (allCommunities?.length ?? 0)}
                scrollableTarget="scrollableDiv"
                loader={<ListLoader />}
                endMessage={<EmptyList />}
              >
                <div className="flex flex-col gap-2">
                  {filteredData?.map((community, index) => {
                    return (
                      <CommunityCard
                        key={index ?? community.id}
                        community={community}
                        compact
                      />
                    );
                  })}
                </div>
              </InfiniteScroll>
            </ScrollShadow>
          )}
        </AccordionItem>
      </Accordion>
    </div>
  );
}
