"use client";

import { useSession } from "next-auth/react";
import useSWR from "swr";
import { getSchedules } from "@/libs/supabase/database";
import InfiniteList from "@/components/InfiniteList";
import ScheduleCard from "@/components/submit/ScheduleCard";
import { Card } from "@heroui/card";
import { Skeleton } from "@heroui/skeleton";
import LoginAlertCard from "@/components/ui/LoginAlertCard";

function SchedulePage() {
  const { data: session } = useSession();
  const username = session?.user?.name;

  const {
    data,
    isLoading,
    error,
    mutate: refresh,
  } = useSWR(username ? ["schedules", username] : null, ([, user]) =>
    getSchedules(user)
  );

  if (!username) {
    return <LoginAlertCard text="view your scheduled posts" />;
  }

  const ScheduleSkeleton = () => (
    <Card className="card w-full p-4 gap-3">
      <Skeleton className="h-6 w-3/4 rounded-lg" />
      <Skeleton className="h-4 w-1/2 rounded-lg" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
    </Card>
  );

  if (isLoading) return <ScheduleSkeleton />;

  if (error) throw new Error(error);

  return (
    <div className="flex flex-col gap-6">
      <InfiniteList
        data={data || []}
        renderItem={(schedule) => (
          <ScheduleCard
            key={schedule.id}
            schedule={schedule}
            onRefresh={refresh}
          />
        )}
        enableClientPagination
        clientItemsPerPage={20}
      />
    </div>
  );
}

export default SchedulePage;
