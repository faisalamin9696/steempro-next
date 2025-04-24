import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import React from "react";
import { IoCloseCircle } from "react-icons/io5";
import { twMerge } from "tailwind-merge";

function MessageReplyRef({
  className,
  text,
  fullWidth,
  handleClose,
  textClassName,
  onPress,
}: {
  className?: string;
  text: string;
  fullWidth?: boolean;
  handleClose?: () => void;
  textClassName?: string;
  onPress?: () => void;
}) {
  return (
    <Card
      isPressable
      onPress={onPress}
      fullWidth={fullWidth}
      radius="none"
      className={twMerge(
        "flex flex-row items-center gap-2 rounded-s-sm rounded-e-md shadow-none bg-black/10 dark:bg-white/20 pe-2 flex-1",
        className
      )}
    >
      <div className="flex-1 min-w-0">
        {/* Add min-w-0 to prevent overflow */}
        <p
          className={twMerge(
            "text-left border-teal-500 border-s-4 rounded-s-sm text-sm break-words whitespace-pre-wrap max-w-full p-2 truncate",
            textClassName
          )}
        >
          {text}
        </p>
      </div>

      <div className="flex-shrink-0">
        {handleClose && (
          <Button
            className="min-h-0 min-w-0 h-6 w-6"
            isIconOnly
            radius="full"
            size="sm"
            onPress={handleClose}
          >
            <IoCloseCircle size={20} />
          </Button>
        )}
      </div>
    </Card>
  );
}

export default MessageReplyRef;
