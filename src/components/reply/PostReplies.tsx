"use client";

import { useAppSelector } from "@/constants/AppFunctions";
import { memo, useState } from "react";
import Reply from "./Reply";
import InfiniteList from "../ui/InfiniteList";
import ReplySkeleton from "./ReplySkeleton";
import SortingControls from "./SortingControls";
import ReplyInput from "./ReplyInput";
import { useTranslation } from "@/utils/i18n";

interface Props {
  comment: Post | Feed;
  onReplyClick?: () => {};
}

export default memo(function PostReplies(props: Props) {
  const { comment } = props;
  const { t } = useTranslation();

  const commentInfo: Post =
    useAppSelector((state) => state.commentReducer.values)[
      `${comment.author}/${comment.permlink}`
    ] ?? comment;
  const postReplies =
    useAppSelector((state) => state.repliesReducer.values)[
      `${comment.author}/${comment.permlink}`
    ] || [];

  const rootReplies = postReplies?.filter(
    (item: Post) => item.depth === commentInfo.depth + 1
  );

  const [sorting, setSorting] = useState<"created" | "payout" | "upvote_count">(
    "payout"
  );

  return (
    <div className="flex flex-col gap-2">
      <div id="comments" className="mt-4">
        <ReplyInput comment={commentInfo} replies={postReplies} />
      </div>

      <div className="mt-8">
        <SortingControls
          currentSort={sorting}
          onSortChange={setSorting}
          totalReplies={postReplies?.length}
        />
      </div>
      <InfiniteList
        className="flex flex-col gap-4"
        sortBy={(a, b) => b[sorting] - a[sorting]}
        sortDirection="asc"
        data={rootReplies?.filter(
          (item: Post) => item.depth === commentInfo.depth + 1
        )}
        renderItem={(reply, index) => (
          <div key={index ?? reply.link_id}>
            <Reply comment={reply} rootComment={commentInfo} />
          </div>
        )}
        itemsPerPage={10}
        loadingComponent={
          <div className="flex flex-col space-y-2">
            <ReplySkeleton />
            <ReplySkeleton />
          </div>
        }
        endText={t('reply.no_more_replies')}
      />
    </div>
  );
});
