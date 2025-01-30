import { Popover, PopoverContent, PopoverTrigger } from "@heroui/popover";
import { Button } from "@heroui/button";

import React from "react";
import { MdSettings } from "react-icons/md";

interface Props {
  children: React.ReactNode;
  advance?: boolean;
  isDisabled?: boolean;
}

export default function CommentOptionWrapper(props: Props) {
  const { children, advance, isDisabled } = props;
  return advance ? (
    <Popover placement={"top-start"}>
      <PopoverTrigger>
        <Button
          size="sm"
          color="default"
          isDisabled={isDisabled}
          startContent={<MdSettings className="text-lg" />}
          radius="lg"
          variant="shadow"
        >
          Advance
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-row gap-4">{children}</div>
      </PopoverContent>
    </Popover>
  ) : (
    children
  );
}
