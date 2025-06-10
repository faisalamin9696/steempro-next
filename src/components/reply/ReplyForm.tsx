"use client";

import React, { memo, useState } from "react";
import Reply from "./Reply";
import { useAppSelector } from "@/constants/AppFunctions";
import ReplyBody from "./ReplyBody";
import ReplyFooter from "./ReplyFooter";
import { twMerge } from "tailwind-merge";

interface Props {
  comment: Post;
  rootComment: Post | Feed;
}

export default memo(function ReplyForm(props: Props) {
  const { comment, rootComment } = props;
  const postReplies =
    useAppSelector((state) => state.repliesReducer.values)[
      `${rootComment.author}/${rootComment.permlink}`
    ] ?? [];
  const isDeep = comment?.depth - rootComment?.depth > 6;

  const [expanded, setExpanded] = useState(!isDeep);
  const [isEditing, setIsEditing] = useState(false);

  const getReplies = (permlink) => {
    return postReplies?.filter((item) => item.parent_permlink === permlink);
  };

  const replies = getReplies(comment.permlink);

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="flex flex-col gap-2 p-2 bg-foreground/5 w-full rounded-lg">
        <ReplyBody
          hideBody={isEditing}
          comment={comment}
          isDeep={isDeep}
          rightContent={
            comment.children >= 1 &&
            !isDeep && (
              <button
                title={expanded ? "Collapse" : "Expand"}
                className=" hover:text-primary"
                onClick={() => setExpanded(!expanded)}
              >
                [{expanded ? "-" : "+"}]
              </button>
            )
          }
        />

        <ReplyFooter
          comment={comment}
          expanded={expanded}
          className="mt-4"
          isDeep={isDeep}
          rootComment={rootComment}
          toggleExpand={() => setExpanded(!expanded)}
          isEditing={setIsEditing}
        />
      </div>

      <div className={twMerge("flex flex-col ")} style={{}}>
        {expanded &&
          replies?.map((item: Post) => (
            <Reply key={item.link_id} comment={item} rootComment={rootComment} />
          ))}
      </div>
    </div>
  );
});
