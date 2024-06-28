import { Card } from "@nextui-org/card";
import { CommentProps } from "../CommentCard";
import CommentHeader from "../components/CommentHeader";
import { getPostThumbnail } from "@/libs/utils/image";
import CommentCover from "../components/CommentCover";
import BodyShort from "@/components/body/BodyShort";
import MarkdownViewer from "@/components/body/MarkdownViewer";
import CommentFooter from "../components/CommentFooter";
import { useAppSelector } from "@/libs/constants/AppFunctions";
import clsx from "clsx";
import Link from "next/link";
import { hasNsfwTag } from "@/libs/utils/StateFunctions";
import { getSettings } from "@/libs/utils/user";

export default function CommentBlogLayout(props: CommentProps) {
  const { comment, isReply } = props;
  const commentInfo =
    useAppSelector((state) => state.commentReducer.values)[
      `${comment.author}/${comment.permlink}`
    ] ?? comment;
  const thumbnail = getPostThumbnail(commentInfo.json_images);
  const targetUrl = `/${comment.category}/@${comment.author}/${comment.permlink}`;
  const settings =
    useAppSelector((state) => state.settingsReducer.value) ?? getSettings();
  const isNsfw = hasNsfwTag(comment) && settings.nsfw !== "Always show";

  return (
    <div
      className="w-full card card-compact flex-col gap-4 
    bg-white/60 dark:bg-white/10"
    >
      <div className="p-2">
        <CommentHeader comment={commentInfo} compact className="w-full" />
      </div>
      <Card
        radius="none"
        as={Link}
        href={targetUrl}
        shadow="none"
        className={clsx(
          commentInfo.is_muted && " opacity-80",
          "w-full bg-transparent gap-4 px-2"
        )}
      >
        <h2 className="card-content font-bold text-lg max-sm:text-medium text-start ">
          {commentInfo.title}
        </h2>

        {isReply ? null : (
          <CommentCover isNsfw={isNsfw} thumbnail src={thumbnail} />
        )}

        <p className="card-content line-clamp-2 overflow-hidden text-start w-full h-full max-sm:text-sm">
          {isReply ? (
            <MarkdownViewer text={commentInfo?.body} />
          ) : (
            <BodyShort body={commentInfo.body} />
          )}
        </p>
      </Card>

      <CommentFooter comment={commentInfo} className="w-full px-2 py-2" />
    </div>
  );
}
