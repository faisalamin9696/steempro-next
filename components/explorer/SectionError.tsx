"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@heroui/button";

/**
 * Per-section error state with a manual retry — shown when a tab's data
 * request fails (5xx / network), instead of silently rendering nothing.
 */
export default function SectionError({
  onRetry,
  message,
}: {
  onRetry: () => void;
  message?: string;
}) {
  return (
    <div className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <div className="p-2.5 rounded-xl bg-danger/10 text-danger shrink-0">
        <AlertTriangle size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-foreground">
          Couldn&apos;t load this section
        </p>
        <p className="text-xs text-default-500 dark:text-default-400 mt-0.5">
          {message ?? "The stats request failed — check your connection and try again."}
        </p>
      </div>
      <Button
        size="sm"
        variant="flat"
        color="danger"
        startContent={<RefreshCw size={14} />}
        onPress={onRetry}
        className="font-semibold shrink-0"
      >
        Retry
      </Button>
    </div>
  );
}
