import { Button } from "@heroui/button";
import { FiClock, FiThumbsUp, FiTrendingUp } from "react-icons/fi";
import { useTranslation } from "@/utils/i18n";

interface SortingControlsProps {
  currentSort: "payout" | "upvote_count" | "created";
  onSortChange: (sort: "payout" | "upvote_count" | "created") => void;
  totalReplies: number;
}

const SortingControls = ({
  currentSort,
  onSortChange,
  totalReplies,
}: SortingControlsProps) => {
  const { t } = useTranslation();
  const sortOptions = [
    { key: "payout" as const, label: t('reply.trending'), icon: FiTrendingUp },
    { key: "upvote_count" as const, label: t('reply.top_voted'), icon: FiThumbsUp },
    { key: "created" as const, label: t('reply.newest'), icon: FiClock },
  ];

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <h3 className="text-lg font-semibold">{t('reply.replies')} ({totalReplies})</h3>
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

export default SortingControls;
