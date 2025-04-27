"use client";

import EmptyList from "@/components/EmptyList";
import ErrorCard from "@/components/ErrorCard";
import LoadingCard from "@/components/LoadingCard";
import CommunitySubscriberItem from "@/components/community/components/CommunitySubscriberItem";
import {
  fetchSds,
  mapSds,
  useAppSelector,
} from "@/libs/constants/AppFunctions";
import usePathnameClient from "@/libs/hooks/usePathnameClient";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card } from "@heroui/card";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { twMerge } from "tailwind-merge";
import AddRoleModal from "../AddRoleModal";
import { ScrollShadow } from "@heroui/scroll-shadow";
import InfiniteScroll from "react-infinite-scroll-component";
import { Role as RoleCheck } from "@/libs/utils/community";
import { AsyncUtils } from "@/libs/utils/async.utils";

interface Props {
  large?: boolean;
  community?: Community;
  stickyHeader?: boolean;
}
export default function CommunityMembers(props: Props) {
  const { large, stickyHeader } = props;
  const [communityInfo, setCommunityInfo] = useState<Community>();
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const [query, setQuery] = useState("");
  const [filteredData, setFilteredData] = useState<Role[]>();
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [limit, setLimit] = useState(30);

  const URL = `/communities_api/getCommunity/${usePathnameClient().community}/${
    loginInfo.name || "null"
  }`;
  const { data, isLoading, error, isValidating } = useSWR(
    !communityInfo && URL,
    fetchSds<Community>
  );

  useEffect(() => {
    if (props.community) setCommunityInfo(props.community);
    else if (data) setCommunityInfo(data);
  }, [props.community, data]);

  const members: Role[] = mapSds(communityInfo?.roles) ?? [];

  useEffect(() => {
    let timeout;
    if (members) {
      timeout = setTimeout(() => {
        setFilteredData(
          members.filter(
            (role) =>
              role.account?.toLowerCase().includes(query.toLowerCase()) ||
              role.title?.toLowerCase().includes(query.toLowerCase()) ||
              role.role?.toLowerCase().includes(query.toLowerCase())
          )
        );
      }, 500);
    }
    return () => clearTimeout(timeout);
  }, [query, communityInfo?.roles]);

  function ListLoader(): React.ReactNode {
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

  async function handleEndReached() {
    if (communityInfo?.roles) {
      await AsyncUtils.sleep(2.5);
      setLimit((prevLimit) => prevLimit + 30);
    }
  }
  return (
    <div className="flex flex-col gap-2 max-h-[500px] pb-10 overflow-auto">
      <div
        className={twMerge(
          "gap-2",
          stickyHeader && "sticky top-0 z-10 backdrop-blur-sm"
        )}
      >
        {/* <div
          className="flex items-center gap-2
             text-default-900 text-lg font-bold mb-4 z-10"
        >
          <p>{"Roles"}</p>
        </div> */}

        <div className="flex flex-row gap-2 items-center px-1">
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

          {RoleCheck.atLeast(communityInfo?.observer_role, "mod") && (
            <Button
              size="sm"
              variant="flat"
              color="success"
              onPress={() => {
                setIsAddRoleOpen(!isAddRoleOpen);
              }}
            >
              Add new
            </Button>
          )}
        </div>
      </div>
      {isLoading || isValidating ? (
        <LoadingCard />
      ) : error ? (
        <ErrorCard message={error.message} />
      ) : !members?.length ? (
        <EmptyList />
      ) : (
        <ScrollShadow className="flex flex-col gap-2" id="scrollDiv">
          <InfiniteScroll
            className={twMerge(
              "relative grid grid-cols-1 gap-4  p-2 md:pb-16",
              large && "md:grid-cols-2"
            )}
            dataLength={limit}
            next={handleEndReached}
            hasMore={limit < (members?.length ?? 0)}
            loader={<ListLoader />}
            scrollableTarget="scrollDiv"
            endMessage={
              !isLoading && (
                <EmptyList text={data ? undefined : "Search anything"} />
              )
            }
          >
            {filteredData?.slice(0, limit)?.map((item) => {
              return (
                <Card
                  key={item.account}
                  className="border compact border-gray-100/10 shadow-md shadow-gray-400 dark:shadow-default-500 bg-transparent backdrop-blur-md"
                >
                  <CommunitySubscriberItem
                    item={item}
                    community={communityInfo}
                  />
                </Card>
              );
            })}
          </InfiniteScroll>
        </ScrollShadow>
      )}
      {isAddRoleOpen && communityInfo && (
        <AddRoleModal
          community={communityInfo}
          isOpen={isAddRoleOpen}
          onOpenChange={setIsAddRoleOpen}
        />
      )}
    </div>
  );
}
