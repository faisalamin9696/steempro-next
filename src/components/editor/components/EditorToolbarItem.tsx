import { Tooltip } from "@heroui/tooltip";
import { memo } from "react";
import { IconType } from "react-icons";

interface ToolbarItemProps {
  tooltip: { description: string; shortcut: string };
  onSelect?: (command: string) => void;
  IconType: IconType;
  size?: "sm" | "md" | "lg";
  isDisabled?: boolean;
}
export const ToolbarItem = memo((props: ToolbarItemProps) => {
  const { tooltip, onSelect, IconType, size, isDisabled } = props;
  const { description, shortcut } = tooltip;

  return (
    <Tooltip
      size="sm"
      content={description + `${shortcut && ` (${shortcut})`} `}
      closeDelay={200}
      delay={1000}
    >
      <button
        className="hover:bg-foreground/15 rounded-md p-[2px]"
        disabled={isDisabled}
        onClick={() => onSelect && onSelect("b")}
      >
        <IconType size={22} />
      </button>
    </Tooltip>
  );
});
