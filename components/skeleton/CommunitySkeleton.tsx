import { Card } from "@heroui/card";
import { Skeleton } from "@heroui/skeleton";

export default function CommunitySkeleton() {
  return (
    <Card className="card p-3 shadow-none border-1 border-divider">
      <div className="flex flex-row items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-md" />

        <div className="flex flex-col flex-1 gap-2">
          <Skeleton className="w-1/3 h-4 rounded-lg" />
          <Skeleton className="w-2/3 h-3 rounded-lg" />

          <div className="flex items-center gap-3 mt-1">
            <Skeleton className="w-16 h-3 rounded-lg" />
            <Skeleton className="w-16 h-3 rounded-lg" />
          </div>
        </div>

        <Skeleton className="w-20 h-8 rounded-lg" />
      </div>
    </Card>
  );
}
