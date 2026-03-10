"use client";

import { Card } from "@heroui/card";
import { Skeleton } from "@heroui/skeleton";
import MainWrapper from "@/components/wrappers/MainWrapper";

export default function PostLoading() {
  return (
    <MainWrapper
      endClass="w-[320px] min-w-[320px] hidden lg:block"
      end={
        <Card className="card w-full p-4 gap-4">
          <Skeleton className="h-25 w-full rounded-xl" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-3/4 rounded-lg" />
            <Skeleton className="h-4 w-1/2 rounded-lg" />
          </div>
          <div className="grid grid-cols-3 gap-2 py-4">
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-10 rounded-lg" />
            <Skeleton className="h-10 rounded-lg" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full rounded-lg" />
            <Skeleton className="h-4 w-5/6 rounded-lg" />
          </div>
        </Card>
      }
    >
      <Card className="card p-6 rounded-xl flex flex-col gap-6 items-start pb-20">
        {/* Header Skeleton */}
        <div className="flex gap-4 items-center w-full">
          <Skeleton className="flex rounded-full w-12 h-12" />
          <div className="flex flex-col gap-2 flex-1">
            <Skeleton className="h-4 w-32 rounded-lg" />
            <Skeleton className="h-3 w-24 rounded-lg" />
          </div>
        </div>

        {/* Title Skeleton */}
        <Skeleton className="h-10 w-4/5 rounded-lg mt-2" />

        {/* Content Skeleton */}
        <div className="space-y-4 w-full pt-8">
          <Skeleton className="h-4 w-full rounded-lg" />
          <Skeleton className="h-4 w-[95%] rounded-lg" />
          <Skeleton className="h-4 w-[98%] rounded-lg" />
          <Skeleton className="h-4 w-[90%] rounded-lg" />

          <Skeleton className="h-64 w-full rounded-2xl mt-4" />

          <Skeleton className="h-4 w-full rounded-lg mt-4" />
          <Skeleton className="h-4 w-[96%] rounded-lg" />
          <Skeleton className="h-4 w-[94%] rounded-lg" />
          <Skeleton className="h-4 w-3/4 rounded-lg" />
        </div>

        {/* Tags Skeleton */}
        <div className="flex gap-2 flex-wrap mt-8">
          <Skeleton className="h-7 w-16 rounded-full" />
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-7 w-14 rounded-full" />
        </div>
      </Card>

      {/* Comments Area Skeleton */}
      <div className="mt-8 space-y-6 px-4">
        <Skeleton className="h-6 w-32 rounded-lg" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="flex rounded-full w-8 h-8 shrink-0" />
              <div className="space-y-2 flex-1 pt-1">
                <Skeleton className="h-3 w-24 rounded-lg" />
                <Skeleton className="h-4 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainWrapper>
  );
}
