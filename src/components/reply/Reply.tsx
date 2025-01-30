"use client";

import ReplyForm from "./ReplyForm";
import { memo, useState } from "react";
import SAvatar from "@/components/SAvatar";
import { useAppSelector } from "@/libs/constants/AppFunctions";
import { Button } from "@heroui/button";

interface Props {
  comment: Post;
  rootComment: Post | Feed;
}

export default memo(function Reply(props: Props) {
  const { comment } = props;
  const commentInfo: Post = (useAppSelector(
    (state) => state.commentReducer.values
  )[`${comment.author}/${comment.permlink}`] ?? comment) as Post;
  const [hidden, setHidden] = useState(!!commentInfo.is_muted);

  return (
    <div className="flex-col w-full relative">
      {hidden ? (
        <div className=" flex items-center gap justify-between mt-2">
          <p>The comment was hidden due to low rating</p>

          <Button
            onPress={() => {
              setHidden(false);
            }}
            size="sm"
            variant="flat"
            color="warning"
          >
            Show
          </Button>
        </div>
      ) : (
        <div className="flex gap-2 ">
          {!commentInfo.link_id ? null : (
            <>
              <div className="flex flex-col gap-2 items-center">
                <SAvatar
                  size="1xs"
                  username={commentInfo.author}
                  className="hidden sm:block"
                />
                {commentInfo?.depth >= 2 && !!commentInfo.children && (
                  <div className="w-[1px] border-default-200 h-full bg-foreground/5 " />
                )}
              </div>
              <div className=" flex items-start gap-2 w-full ">
                <ReplyForm {...props} comment={commentInfo} />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
});
