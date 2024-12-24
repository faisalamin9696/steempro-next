"use client";

import MainWrapper from "@/components/wrappers/MainWrapper";
import React from "react";
import ScheduleItemCard from "@/components/ScheduleItemCard";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import notFound from "@/app/not-found";
import EmptyList from "@/components/EmptyList";
import CommentSkeleton from "@/components/comment/components/CommentSkeleton";

export default function SchedulesPage() {
  const { data: session } = useSession();

  const { data, isLoading, error } = useSWR<Schedule[]>(
    session?.user?.name && `/api/schedules/posts`,
    async function fetcher(api: string): Promise<Schedule[]> {
      return (await fetch(api)).json();
    },
    {
      shouldRetryOnError: true,
      refreshInterval: 5 * 60 * 1000,
      errorRetryInterval: 5000,
    }
  );

  if (error) return notFound();

  return (
    <MainWrapper>
      <div className=" flex w-full flex-col gap-4">
        <p className=" text-xl font-bold opacity-80">Schedule Posts</p>

        {isLoading ? (
          <div className="flex flex-col space-y-2">
            <CommentSkeleton />
            <CommentSkeleton />
          </div>
        ) : !!!data?.length ? (
          <EmptyList />
        ) : (
          data?.map((item) => {
            return <ScheduleItemCard key={item.id} item={item} />;
          })
        )}
      </div>
    </MainWrapper>
  );
}
