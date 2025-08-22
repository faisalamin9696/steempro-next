import { Card } from "@heroui/card";
import { CommentProps } from "../CommentCard";
import CommentHeader from "../components/CommentHeader";
import CommentFooter from "../components/CommentFooter";
import MarkdownViewer from "@/components/body/MarkdownViewer";
import BodyShort from "@/components/body/BodyShort";
import CommentCover from "../components/CommentCover";
import { useAppSelector } from "@/constants/AppFunctions";
import { hasNsfwTag } from "@/utils/stateFunctions";
import { getSettings } from "@/utils/user";
import { twMerge } from "tailwind-merge";
import { getThumbnail } from "@/utils/parseImage";
import SLink from "@/components/ui/SLink";

export default function CommentListLayout(props: CommentProps) {
  const { comment, isReply, isSearch } = props;
  const commentInfo =
    useAppSelector((state) => state.commentReducer.values)[
      `${comment.author}/${comment.permlink}`
    ] ?? comment;
  const settings =
    useAppSelector((state) => state.settingsReducer.value) ?? getSettings();
  const thumbnail = getThumbnail(commentInfo.json_images, "256x512");
  const targetUrl = `/${comment.category}/@${comment.author}/${comment.permlink}`;
  const isNsfw = hasNsfwTag(comment) && settings?.nsfw !== "Always show";

  return (
    <div
      className={twMerge(
        `w-full shadow-md rounded-2xl
        items-center flex-col  gap-1 comment-card`,
        isSearch ? " p-2" : "p-[14px]"
      )}
    >
      <div className="flex w-full items-start justify-between gap-4">
        <div className="flex flex-col items-start w-full gap-2">
          <CommentHeader compact comment={commentInfo} className="w-full" />

          <Card
            as={SLink}
            href={targetUrl}
            radius="none"
            shadow="none"
            className={twMerge(
              !!commentInfo.is_muted && " opacity-80",
              "bg-transparent main-comment-list w-full !p-0"
            )}
          >
            <div
              className={twMerge(
                "flex items-center gap-2 w-full py-0",
                commentInfo.is_muted ? " blur-[2px]" : ""
              )}
            >
              <div className="pl-1 text-container space-y-2 flex-1">
                <div className=" text-start font-bold text-md">
                  {commentInfo.title}
                </div>

                {isReply && !isSearch ? (
                  <div className="description text-xs">
                    <MarkdownViewer text={commentInfo?.body} />
                  </div>
                ) : (
                  <div className="text-start text-sm line-clamp-1">
                    <BodyShort body={commentInfo.body} />
                  </div>
                )}
              </div>

              <div
                className={twMerge(commentInfo.is_muted ? " blur-[2px]" : "")}
              >
                {isReply || !isSearch ? null : isNsfw ? null : (
                  <CommentCover
                    isNsfw={isNsfw}
                    size={isSearch ? "xs" : undefined}
                    src={thumbnail}
                    targetUrl={targetUrl}
                  />
                )}
              </div>
            </div>
          </Card>
        </div>

        {!isSearch && (
          <div
            className={twMerge("h-max", comment.is_muted ? " blur-[2px]" : "")}
          >
            {isReply ? null : isNsfw ? null : (
              <CommentCover
                isNsfw={isNsfw}
                size="sm"
                src={thumbnail}
                targetUrl={targetUrl}
              />
            )}
          </div>
        )}
      </div>

      {!isSearch && (
        <CommentFooter {...props} comment={commentInfo} className="w-full mt-4" />
      )}
    </div>
  );
}
