import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverProps,
} from "@heroui/popover";
import React, { memo } from "react";
import { twMerge } from "tailwind-merge";

interface Props extends Omit<PopoverProps, "children"> {
  title?: string;
  description?: string;
  trigger: React.ReactNode | ((close: () => void) => React.ReactNode);
  children?: React.ReactNode | ((close: () => void) => React.ReactNode);
}

export default memo(function SPopover({
  title,
  description,
  trigger,
  children,
  ...rest
}: Props) {
  const [open, setOpen] = React.useState(false);

  const close = () => setOpen(false);

  return (
    <Popover isOpen={open} onOpenChange={setOpen} {...rest}>
      <PopoverTrigger>
        {typeof trigger === "function" ? trigger(close) : trigger}
      </PopoverTrigger>

      <PopoverContent className={twMerge("p-2", rest.classNames?.content)}>
        <div className="flex flex-col gap-2">
          {(title || description) && (
            <div className="flex flex-col gap-1">
              {title && <p className="text-medium font-semibold">{title}</p>}
              {description && (
                <p className="text-sm text-muted">{description}</p>
              )}
            </div>
          )}
          {typeof children === "function" ? children(close) : children}
        </div>
      </PopoverContent>
    </Popover>
  );
});
