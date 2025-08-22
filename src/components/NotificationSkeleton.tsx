import React from "react";

function NotificationSkeleton() {
  return (
    <div className="flex gap-2 items-start border-b-1 border-default-900/20 pb-4">
      {/* Avatar placeholder */}
      <div className="relative h-6 w-6 rounded-full bg-default-200 animate-pulse">
        <div className="h-2 w-2 rounded-full bg-default-400 absolute bottom-0 right-0" />
      </div>

      {/* Content placeholder */}
      <div className="flex flex-col gap-2 flex-1">
        {/* First row placeholder */}
        <div className="flex flex-row gap-2 items-center">
          <div className="h-4 w-24 rounded-md bg-default-200 animate-pulse" />
          <div className="h-4 w-12 rounded-md bg-default-200 animate-pulse" />
        </div>

        {/* Second row placeholder */}
        <div className="flex flex-row gap-2 items-center">
          <div className="h-4 w-16 rounded-md bg-default-200 animate-pulse" />
          <div className="h-4 w-20 rounded-md bg-default-200 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default NotificationSkeleton;
