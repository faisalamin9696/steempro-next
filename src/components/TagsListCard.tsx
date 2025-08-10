import React from "react";
import STag from "./ui/STag";
import { Chip } from "@heroui/chip";
import SLink from "./ui/SLink";

export default function TagsListCard({
  tags = [],
  isDisabled,
}: {
  tags: string[];
  isDisabled?: boolean;
}) {
  return (
    <div className="flex gap-2 overscroll-x-contain flex-wrap shrink-0">
      {tags
        ?.filter((tag) => !!tag)
        ?.map((tag, index) => {
          return (
            <Chip
              color="primary"
              variant="flat"
              isDisabled={isDisabled}
              as={SLink}
              href={`/trending/${tag}`}
            >
              {`#${tag}`}
            </Chip>
          );
        })}
    </div>
  );
}
