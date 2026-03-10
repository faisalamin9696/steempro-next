import { Skeleton } from "@heroui/skeleton";

function ProfileHeaderSkeleton() {
  return (
    <div className="flex flex-col h-34 sm:h-46 relative">
      {/* Cover photo placeholder */}
      <Skeleton className="rounded-md h-20 sm:h-[120px] w-full" />

      {/* Avatar */}
      <Skeleton className="absolute left-8 top-10 sm:top-18 border-4 border-background w-[70px] sm:w-[100px] h-[70px] sm:h-[100px] rounded-xl bg-background" />

      {/* Name & subtitle */}
      <div className="absolute left-30 sm:left-38 top-[88px] sm:top-32 flex flex-col space-y-2">
        <Skeleton className="h-2 w-40 rounded "></Skeleton>
        <Skeleton className="h-2 w-24 rounded "></Skeleton>
      </div>
    </div>
  );
}

export default ProfileHeaderSkeleton;
