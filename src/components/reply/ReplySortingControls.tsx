import { Button } from "@heroui/button";
import { FiClock, FiThumbsUp, FiTrendingUp } from "react-icons/fi";

interface SortingControlsProps {
  currentSort: "payout" | "upvote_count" | "created";
  onSortChange: (sort: "payout" | "upvote_count" | "created") => void;
  totalReplies: number;
}

const ReplySortingControls = ({
  currentSort,
  onSortChange,
  totalReplies,
}: SortingControlsProps) => {
  const sortOptions = [
    { key: "payout" as const, label: "Trending", icon: FiTrendingUp },
    { key: "upvote_count" as const, label: "Top Voted", icon: FiThumbsUp },
    { key: "created" as const, label: "Newest", icon: FiClock },
  ];

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <h3 className="text-lg font-semibold">Replies ({totalReplies})</h3>
        <div className="flex items-center gap-2">
          {sortOptions.map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={currentSort === key ? "solid" : "light"}
              size="sm"
              color={currentSort === key ? "primary" : "default"}
              onPress={() => onSortChange(key)}
              className="gap-2"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReplySortingControls;
