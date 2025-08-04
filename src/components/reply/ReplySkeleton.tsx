import React from "react";
import { twMerge } from "tailwind-merge";

interface CommentSkeletonProps {
  className?: string;
  showReply?: boolean;
  showVotes?: boolean;
}

const ReplySkeleton: React.FC<CommentSkeletonProps> = ({
  className,
  showReply = true,
  showVotes = true,
}) => {
  return (
    <div
      className={twMerge(
        "w-full p-4 border-b border-gray-200 dark:border-gray-700",
        className
      )}
    >
      {/* Header with user info and timestamp */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 animate-pulse" />
        <div className="flex-1 space-y-1">
          <div className="h-4 w-1/4 bg-gray-300 dark:bg-gray-600 animate-pulse rounded" />
          <div className="h-3 w-1/3 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
        </div>
      </div>

      {/* Comment content */}
      <div className="space-y-2 my-3">
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
        <div className="h-4 w-4/5 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
        <div className="h-4 w-3/5 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
      </div>

      {/* Footer with votes and reply */}
      <div className="flex items-center justify-between mt-3">
        {showVotes && (
          <div className="flex items-center gap-3">
            <div className="h-4 w-8 bg-gray-300 dark:bg-gray-600 animate-pulse rounded" />
            <div className="h-4 w-12 bg-gray-300 dark:bg-gray-600 animate-pulse rounded" />
          </div>
        )}

        {showReply && (
          <div className="h-4 w-12 bg-gray-300 dark:bg-gray-600 animate-pulse rounded" />
        )}
      </div>
    </div>
  );
};

export default ReplySkeleton;
