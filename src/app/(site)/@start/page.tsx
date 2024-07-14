"use client";

import CommunityCard from "@/components/community/CommunityCard";
import ErrorCard from "@/components/ErrorCard";
import LoadingCard from "@/components/LoadingCard";
import {
  awaitTimeout,
  fetchSds,
  useAppSelector,
} from "@/libs/constants/AppFunctions";
import { getAnnouncements } from "@/libs/firebase/firebaseApp";
import { ScrollShadow } from "@nextui-org/scroll-shadow";
import { Button } from "@nextui-org/button";

import Link from "next/link";
import { GrAnnounce } from "react-icons/gr";
import useSWR from "swr";
import { HiMiniUserGroup } from "react-icons/hi2";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import EmptyList from "@/components/EmptyList";
import { Accordion, AccordionItem } from "@nextui-org/react";

export default function HomeStart() {
  const { data, error, mutate, isLoading, isValidating } = useSWR(
    "annoucements",
    getAnnouncements
  );
  const annoucements = data?.["posts"];
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

  if (error) return;

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
      await awaitTimeout(2.5);
      const newRows = loadMoreRows(allCommunities, rows);
      setRows([...rows, ...newRows!]);
      setLoadingMore(false);
    }
  }

  function ListLoader(): JSX.Element {
    return (
      <div className="flex justify-center items-center">
        <Button
          color="default"
          variant="light"
          className="self-center"
          isIconOnly
          isLoading={loadingMore}
          isDisabled
          onClick={handleEndReached}
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
            <ErrorCard message={error?.message} onClick={mutate} />
          ) : (
            <div className="flex flex-col gap-4">
              {annoucements?.map((annoucement, index) => {
                return (
                  <div
                    key={index ?? annoucement.authPerm}
                    className="bg-white rounded-lg dark:bg-white/5 text-sm px-2 py-1"
                  >
                    <Link
                      className=" text-blue-400 hover:underline font-semibold"
                      href={`/@${annoucement.authPerm}`}
                    >
                      {annoucement.title}
                    </Link>
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
              <Link className="text-medium font-semibold" href={"/communities"}>
                {"Top Communities"}
              </Link>{" "}
            </div>
          }
        >
          {isCommunitiesLoading ? (
            <LoadingCard />
          ) : communitiesError ? (
            <ErrorCard
              message={communitiesError?.message}
              onClick={mutateCommunities}
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
