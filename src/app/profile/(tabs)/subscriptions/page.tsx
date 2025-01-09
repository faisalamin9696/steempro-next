"use client";

import notFound from "@/app/not-found";
import CommentSkeleton from "@/components/comment/components/CommentSkeleton";
import CommunityCard from "@/components/community/components/CommunityCard";
import LoadingCard from "@/components/LoadingCard";
// import FeedList from '@/components/comment/FeedList';
import { fetchSds, useAppSelector } from "@/libs/constants/AppFunctions";
import usePathnameClient from "@/libs/utils/usePathnameClient";
import { Button } from "@nextui-org/button";
import clsx from "clsx";
import Link from "next/link";
import React from "react";
import { LuPencilLine } from "react-icons/lu";
import useSWR from "swr";

export default function ProfileSubsribtionsTab() {
  const { username } = usePathnameClient();
  const loginInfo = useAppSelector((state) => state.loginReducer.value);

  const URL = `/communities_api/getCommunitiesBySubscriber/${username}/${
    loginInfo.name || "null"
  }`;
  const { data, isLoading, error } = useSWR(URL, fetchSds<Community[]>);
  const isSelf = !!loginInfo.name && loginInfo.name === username;

  if (isLoading)
    return (
      <div className="flex flex-col gap-2 md:grid md:grid-cols-2">
        <CommentSkeleton />
        <CommentSkeleton />
      </div>
    );

  if (error) return notFound();

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
      {data?.map((community, index) => {
        return (
          <div key={index ?? community.id} className={`w-full`}>
            <CommunityCard
              className=" h-full"
              community={community}
              compact
              endContent={
                <div className="flex gap-1 items-center">
                  {isSelf && (
                    <Button
                      size="sm"
                      isIconOnly
                      variant="flat"
                      title="Create post"
                      className={clsx("min-w-0  h-6")}
                      as={Link}
                      href={
                        {
                          pathname: `/submit`,
                          query: {
                            account: community?.account,
                            title: community?.title,
                          },
                        } as any
                      }
                      color="secondary"
                      radius="full"
                    >
                      <LuPencilLine className="text-lg" />
                    </Button>
                  )}
                  <Button
                    as={Link}
                    href={`/trending/${community.account}`}
                    size="sm"
                    color="primary"
                    radius="full"
                  >
                    Explore
                  </Button>
                </div>
              }
            />
          </div>
        );
      })}
    </div>
  );
}
