"use client";

import MainWrapper from "@/components/wrappers/MainWrapper";
import React from "react";
import ScheduleItemCard from "@/components/ScheduleItemCard";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import notFound from "@/app/not-found";
import InfiniteScroll from "@/components/ui/InfiniteScroll";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";

async function fetcher<T>(
  api: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(api, {
    keepalive: true,
    ...options,
  });

  // If the status code is not in the range 200-299,
  // we still try to parse and throw it.
  if (!response.ok) {
    const error: any = new Error("An error occurred while fetching the data.");
    // Attach extra info to the error object.
    error.info = await response.json();
    error.status = response.status;
    throw error;
  }
  return response?.json();
}


export default function SchedulesPage() {
  const { data: session } = useSession();



  const getKey =
    (pageIndex: number, previousPageData: any[] | null) => {
      if (!session?.user?.name) return null; // Don't search until button is clicked
      if (previousPageData && previousPageData.length === 0) return null;
      return `/api/schedules/posts?page=${pageIndex}&limit=30`

    }


  const { data, isLoading, error } = useSWR<Schedule[]>(
    session?.user?.name && `/api/schedules/posts?user=${session.user.name}`,
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
      <div className=" flex w-full flex-col gap-4 pb-4">
        <p className=" text-xl font-bold opacity-80">Schedule Posts</p>
        <InfiniteScroll<Schedule>
          getKey={getKey}
          fetcher={fetcher}
          keyExtractor={(item) => item.id?.toString()}
          itemsClassName="gap-6"
          renderItem={(schedule) => (
            <ScheduleItemCard key={schedule.id} item={schedule} />
          )}
          pageSize={30} // Make sure this matches your API's page size
        />
        <ScrollToTopButton />
      </div>
    </MainWrapper>
  );
}
