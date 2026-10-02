import { Chip } from "@heroui/chip";
import BarChart from "./charts/BarChart";
import type { TagStat } from "@/utils/explorerStats";
import { compact } from "./format";

/**
 * Top tags all-time + currently active tags (server-rendered).
 * Every tag links to its public feed: /trending/{tag}.
 */
export default function ExplorerTags({
  top,
  active,
}: {
  top: TagStat[];
  active: TagStat[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h3 className="text-sm font-bold text-default-600 dark:text-default-300 mb-3">
          Most used tags (all time)
        </h3>
        <BarChart
          log
          color="bg-primary"
          data={top.map((tag) => ({
            label: tag.tag,
            value: tag.count,
            href: `/trending/${tag.tag}`,
            hint: `${tag.tag} — ${compact(tag.count)} posts`,
          }))}
        />
      </div>
      <div>
        <h3 className="text-sm font-bold text-default-600 dark:text-default-300 mb-3">
          Active tags (posts with pending payouts)
        </h3>
        <div className="flex flex-wrap gap-2">
          {active.map((tag) => (
            <Chip
              key={tag.tag}
              as="a"
              href={`/trending/${tag.tag}`}
              size="sm"
              variant="flat"
              color="primary"
              className="font-semibold"
            >
              {tag.tag} · {compact(tag.count)}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}
