import { Button } from "@heroui/button";
import { Tooltip } from "@heroui/react";
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
      content={description + ` (${shortcut})`}
      closeDelay={200}
      delay={1000}
    >
      <Button
        size={size ?? "sm"}
        isDisabled={isDisabled}
        isIconOnly
        className="border-none"
        onPress={() => onSelect && onSelect("b")}
      >
        <IconType className="text-lg rounded-none" />
      </Button>
    </Tooltip>
  );
});
