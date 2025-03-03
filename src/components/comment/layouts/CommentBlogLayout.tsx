import { Card } from "@heroui/card";
import { CommentProps } from "../CommentCard";
import CommentHeader from "../components/CommentHeader";
import CommentCover from "../components/CommentCover";
import BodyShort from "@/components/body/BodyShort";
import MarkdownViewer from "@/components/body/MarkdownViewer";
import CommentFooter from "../components/CommentFooter";
import { useAppSelector } from "@/libs/constants/AppFunctions";
import clsx from "clsx";
import { hasNsfwTag } from "@/libs/utils/StateFunctions";
import { getSettings } from "@/libs/utils/user";
import { getThumbnail } from "@/libs/utils/image";
import { twMerge } from "tailwind-merge";
import SLink from "@/components/SLink";

export default function CommentBlogLayout(props: CommentProps) {
  const { comment, isReply } = props;
  const commentInfo =
    useAppSelector((state) => state.commentReducer.values)[
      `${comment.author}/${comment.permlink}`
    ] ?? comment;
  const thumbnail = getThumbnail(commentInfo.json_images, "640x480");
  const targetUrl = `/${comment.category}/@${comment.author}/${comment.permlink}`;
  const settings =
    useAppSelector((state) => state.settingsReducer.value) ?? getSettings();
  const isNsfw = hasNsfwTag(comment) && settings.nsfw !== "Always show";

  return (
    <div
      className="w-full rounded-2xl flex-col gap-4 
    bg-white/60 dark:bg-white/10"
    >
      <div className="p-2">
        <CommentHeader comment={commentInfo} compact className="w-full" />
      </div>
      <Card
        radius="none"
        as={SLink}
        href={targetUrl}
        shadow="none"
        className={clsx(
          commentInfo.is_muted && " opacity-80",
          "w-full bg-transparent gap-4 px-2"
        )}
      >
        <h2
          className={twMerge(
            "mt-2 font-bold text-lg max-sm:text-medium text-start ",
            commentInfo.is_muted ? " blur-[2px]" : ""
          )}
        >
          {commentInfo.title}
        </h2>

        <div className={twMerge(commentInfo.is_muted ? " blur-[2px]" : "")}>
          {isNsfw ? null : isReply ? null : (
            <CommentCover
              isNsfw={isNsfw}
              thumbnail
              src={thumbnail}
              targetUrl={targetUrl}
            />
          )}
        </div>

        <div
          className={twMerge(
            "line-clamp-2 overflow-hidden text-start w-full h-full max-sm:text-sm",
            commentInfo.is_muted ? " blur-[2px]" : ""
          )}
        >
          {isReply ? (
            <MarkdownViewer text={commentInfo?.body} />
          ) : (
            <BodyShort body={commentInfo.body} />
          )}
        </div>
      </Card>

      <CommentFooter comment={commentInfo} className="w-full px-2 py-2" />
    </div>
  );
}
