import type { LucideIcon } from "lucide-react";

/**
 * Section heading used across the explorer dashboard. Server-safe (no
 * directive) so both the server-rendered sections and client widgets can use
 * it.
 */
export default function ExplorerSection({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div className="flex items-start gap-3 min-w-0">
        <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <h2 className="font-bold text-lg leading-tight">{title}</h2>
          {description ? (
            <p className="text-xs text-default-500 dark:text-default-400 mt-0.5">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
