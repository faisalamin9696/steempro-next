import { Button } from "@heroui/button";
import { BiUpvote } from "react-icons/bi";
import { LuReply } from "react-icons/lu";
import { GoMention } from "react-icons/go";
import { RiUserFollowLine } from "react-icons/ri";
import { PiList } from "react-icons/pi";

interface SortingControlsProps {
  currentSort: "vote" | "reply" | "mention" | "follow" | "all";
  onSortChange: (sort: "vote" | "reply" | "mention" | "follow" | "all") => void;
}

const NotificationSortingControls = ({
  currentSort,
  onSortChange,
}: SortingControlsProps) => {
  const sortOptions = [
    { key: "all" as const, label: "All", icon: PiList },
    { key: "vote" as const, label: "Vote", icon: BiUpvote },
    { key: "reply" as const, label: "Reply", icon: LuReply },
    { key: "mention" as const, label: "Mention", icon: GoMention },
    { key: "follow" as const, label: "Follow", icon: RiUserFollowLine },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
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
  );
};

export default NotificationSortingControls;
