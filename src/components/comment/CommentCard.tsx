"use client";

import { memo } from "react";
import "./style.scss";

import { useAppSelector } from "@/constants/AppFunctions";
import { getSettings } from "@/utils/user";
import CommentListLayout from "./layouts/CommentListLayout";
import CommentBlogLayout from "./layouts/CommentBlogLayout";
import CommentGridLayout from "./layouts/CommentGridLayout";
import { useDeviceInfo } from "@/hooks/useDeviceInfo";

interface Props {
  comment: Feed | Post;
  isReply?: boolean;
  isCommunity?: boolean;
}

export interface CommentProps {
  comment: Feed | Post;
  className?: string;
  isReply?: boolean;
  compact?: boolean;
  isDetails?: boolean;
  onEditClick?: (comment: Feed | Post) => void;
  onDeleteClick?: (comment: Feed | Post) => void;
  onMuteClick?: (comment: Feed | Post) => void;
  onPinClick?: (comment: Feed | Post) => void;
  onPublishClick?: (comment: Feed | Post) => void;
  isSearch?: boolean;
  isCommunity?: boolean;
}

export default memo(function CommentCard(props: Props) {
  const { comment } = props;
  const commentInfo =
    useAppSelector((state) => state.commentReducer.values)[
      `${comment?.author}/${comment?.permlink}`
    ] ?? comment;
  const settings =
    useAppSelector((state) => state.settingsReducer.value) ?? getSettings();
  const { isMobile } = useDeviceInfo();

  let commentLayout: React.ReactNode;

  if (isMobile) {
    commentLayout = <CommentBlogLayout {...props} comment={commentInfo} />;
  } else {
    switch (settings.feedStyle) {
      case "list":
        commentLayout = <CommentListLayout {...props} comment={commentInfo} />;
        break;
      case "grid":
        commentLayout = <CommentGridLayout {...props} comment={commentInfo} />;
        break;
      case "blogs":
        commentLayout = <CommentBlogLayout {...props} comment={commentInfo} />;
        break;
      default:
        commentLayout = <CommentListLayout {...props} comment={commentInfo} />;
    }
  }

  return commentLayout;
});
