"use client";

import notFound from "@/app/not-found";
import CommentSkeleton from "@/components/comment/components/CommentSkeleton";
import CommunityCard from "@/components/community/components/CommunityCard";
import SLink from "@/components/SLink";
import { fetchSds, useAppSelector } from "@/libs/constants/AppFunctions";
import { useDeviceInfo } from "@/libs/hooks/useDeviceInfo";
import usePathnameClient from "@/libs/hooks/usePathnameClient";
import { Button } from "@heroui/button";
import { useSession } from "next-auth/react";
import React from "react";
import { LuPencilLine } from "react-icons/lu";
import useSWR from "swr";

export default function ProfileSubsribtionsTab() {
  const { username } = usePathnameClient();
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
    <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
      {data?.map((community, index) => {
        return (
          <SLink
            key={index ?? community.id}
            className={`w-full`}
            href={
              {
                pathname: `/submit`,
                query: {
                  account: community?.account,
                  title: community?.title,
                },
              } as any
            }
          >
            <CommunityCard
              community={community}
              compact
              endContent={
                <div className="flex gap-1 items-center">
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
          </SLink>
        );
      })}
    </div>
  );
}
