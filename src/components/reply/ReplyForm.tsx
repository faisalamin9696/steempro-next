"use client";

import React, { memo, useEffect, useState } from "react";
import Reply from "./Reply";
import { useAppSelector } from "@/constants/AppFunctions";
import ReplyBody from "./ReplyBody";
import ReplyFooter from "./ReplyFooter";
import { twMerge } from "tailwind-merge";
import { difference } from "lodash";
import { useTranslation } from "@/utils/i18n";

interface Props {
  comment: Post;
  rootComment: Post | Feed;
  isExpanded?: (expanded: boolean) => void;
}

export default memo(function ReplyForm(props: Props) {
  const { comment, rootComment } = props;
  const { t } = useTranslation();

  const postReplies =
    useAppSelector((state) => state.repliesReducer.values)[
      `${rootComment.author}/${rootComment.permlink}`
    ] ?? [];

  const excludeRoot = difference(
    postReplies,
    postReplies?.filter((item) => item.depth === rootComment.depth + 1)
  );

  const isDeep = comment?.depth - rootComment?.depth > 5;

  const [expanded, setExpanded] = useState(!isDeep);
  const [isEditing, setIsEditing] = useState(false);

  const getReplies = (permlink) => {
    return excludeRoot?.filter((item) => item.parent_permlink === permlink);
  };

  const replies = getReplies(comment.permlink);

  useEffect(() => {
    props.isExpanded?.(expanded);
  }, [expanded]);

  return (
    <div className="flex flex-col w-full gap-4" >
      <div className="flex flex-col gap-2 p-2 bg-foreground/5 w-full rounded-lg ">
        <ReplyBody
          hideBody={isEditing}
          comment={comment}
          isDeep={isDeep}
          rightContent={
            comment.children >= 1 &&
            !isDeep && (
              <button
                title={expanded ? t('reply.collapse') : t('reply.expand')}
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
          className="mt-2"
          isDeep={isDeep}
          rootComment={rootComment}
          toggleExpand={() => setExpanded(!expanded)}
          isEditing={setIsEditing}
        />
      </div>

      <div className={twMerge("flex flex-col ")} style={{}}>
        {expanded &&
          replies?.map((item: Post) => (
            <Reply
              key={item.link_id}
              comment={item}
              rootComment={rootComment}
            />
          ))}
      </div>
    </div>
  );
});
