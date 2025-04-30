import React from "react";
import { twMerge } from "tailwind-merge";

interface Props {
  comment: Feed | Post;
  className?: string;
  roleClassName?: string;
  titleClassName?: string;
}
export default function RoleTitleCard(props: Props) {
  const { comment, className, roleClassName, titleClassName } = props;

  if (!comment.author_role && !comment.author_title) return null;
  return (
    <div
      className={twMerge(
        "main-div gap-x-2 flex flex-wrap items-center min-w-0",
        className
      )}
    >
      {comment.author_role && (
        <p
          className={twMerge(
            "flex-none break-words whitespace-normal",
            roleClassName
          )}
        >
          {comment.author_role}
        </p>
      )}
      {comment.author_title && (
        <p
          className={twMerge(
            "flex-none bg-foreground/10 dark:bg-foreground/30 text-tiny font-light px-1 rounded-lg break-words whitespace-normal",
            titleClassName
          )}
        >
          {comment.author_title}
        </p>
      )}
    </div>
  );
}
