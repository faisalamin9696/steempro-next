"use client";

import notFound from "@/app/not-found";
import CommentSkeleton from "@/components/comment/components/CommentSkeleton";
import CommunityCard from "@/components/community/components/CommunityCard";
import SubscribeButton from "@/components/SubscribeButton";
import SLink from "@/components/ui/SLink";
import STable from "@/components/ui/STable";
import { fetchSds, useAppSelector } from "@/constants/AppFunctions";
import { useDeviceInfo } from "@/hooks/useDeviceInfo";
import { Button } from "@heroui/button";
import { useSession } from "next-auth/react";
import React from "react";
import { LuPencilLine } from "react-icons/lu";
import useSWR from "swr";

export default function SubscriptionTab({ username }: { username: string }) {
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const { isTablet } = useDeviceInfo();
  const { data: session } = useSession();

  const URL = `/communities_api/getCommunitiesBySubscriber/${username}/${
    loginInfo.name || "null"
  }`;
  const { data, isLoading, error } = useSWR(URL, fetchSds<Community[]>);
  const isSelf = session?.user?.name === username;

  if (isLoading)
    return (
      <div className="flex flex-col gap-2 md:grid md:grid-cols-2">
        <CommentSkeleton />
        <CommentSkeleton />
      </div>
    );

  if (error) return notFound();

  return (
    <STable
      filterByValue={["title", "account", "about"]}
      title={null}
      data={data?.sort((a, b) => a.rank - b.rank) || []}
      tableRow={(community) => {
        return (
          <CommunityCard
            community={community}
            className="!bg-transparent shadow-none px-2 py-0"
            endContent={
              <div className="flex flex-wrap gap-2 items-center">
                <SubscribeButton size="sm" community={community} />
                {isSelf && (
                  <Button
                    size={!isTablet ? "sm" : "md"}
                    isIconOnly
                    variant="flat"
                    title="Create post"
                    as={SLink}
                    href={
                      {
                        pathname: `/submit`,
                        query: {
                          account: community?.account,
                          title: community?.title,
                        },
                      } as any
                    }
                    color="default"
                    radius="full"
                  >
                    <LuPencilLine className="text-lg" />
                  </Button>
                )}
              </div>
            }
          />
        );
      }}
      itemsPerPage={20}
      bodyClassName="grid grid-cols-1 1md:grid-cols-2 lg:grid-cols-1 1xl:grid-cols-2 gap-6"
    />
  );
}
