import PostHeader from "./PostHeader";
import PostBody from "./PostBody";
import PostFooter from "./PostFooter";
import { useAppSelector } from "@/hooks/redux/store";
import { Image } from "@heroui/image";
import Link from "next/link";
import PostLink from "./PostLink";
import NsfwOverlay from "../nsfw/NsfwOverlay";
import { hasNsfwTag } from "@/utils";
import { getThumbnail } from "@/utils/image";
import { twMerge } from "tailwind-merge";
import { Alert } from "@heroui/alert";
import { CircleSlash2 } from "lucide-react";

interface Props {
  comment: Feed | Post;
  isDetail?: boolean;
  layout?: FeedStyle;
}

function PostCard({ comment, isDetail, layout = "list" }: Props) {
  const commentData =
    useAppSelector(
      (state) =>
        state.commentReducer.values[`${comment.author}/${comment.permlink}`],
    ) ?? comment;
  const isMuted = Boolean(commentData.is_muted);
  const isNsfw = hasNsfwTag(commentData);

  if (commentData.link_id === 0) return null;

  // Modern Card Styles
  const cardClassName =
    "group relative flex flex-col bg-content1/40 dark:bg-content1/20 backdrop-blur-md border border-default-100  hover:bg-content1/60 hover:shadow-lg hover:border-primary/20 transition-all duration-300 overflow-hidden";

  if (layout === "grid") {
    const thumbnail = getThumbnail(commentData.json_images, "640x0");

    return (
      <article className={twMerge(cardClassName, "h-full rounded-2xl")}>
        {isMuted && (
          <Alert
            color="warning"
            variant="faded"
            title="Muted"
            icon={
              <div>
                <CircleSlash2 />
              </div>
            }
            className="rounded-none border-none border-b border-default-100"
          />
        )}
        <div className="relative aspect-video w-full overflow-hidden bg-content2/50">
          <NsfwOverlay isNsfw={isNsfw} className="h-full w-full">
            <Link
              href={`/@${commentData.author}/${commentData.permlink}`}
              className="block h-full w-full"
            >
              {thumbnail ? (
                <Image
                  src={thumbnail}
                  removeWrapper
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  alt="Post thumbnail"
                  radius="none"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-default-400">
                  No Image
                </div>
              )}
            </Link>
          </NsfwOverlay>
        </div>

        <div className="flex flex-1 flex-col justify-between gap-3 p-3">
          <div className="space-y-2">
            <PostLink
              comment={commentData}
              title={commentData.title}
              className="block font-bold text-default-900 line-clamp-2 text-lg hover:text-primary transition-colors"
            />
            <PostHeader comment={commentData} isDetail={isDetail} />
          </div>

          <div className="pt-2">
            <PostFooter isMobile comment={commentData} isDetail={isDetail} />
          </div>
        </div>
      </article>
    );
  }

  // List Layout
  return (
    <article className={twMerge(cardClassName, "rounded-2xl p-4 gap-4")}>
      {isMuted && (
        <Alert
          color="warning"
          variant="faded"
          title="This post is muted by a community moderator"
          icon={
            <div>
              <CircleSlash2 />
            </div>
          }
          className="mb-1"
        />
      )}
      <PostHeader comment={commentData} isDetail={isDetail} />

      <div className="z-10 text-default-600">
        <PostBody comment={commentData} layout={layout} />
      </div>

      <div className="flex items-center pt-1">
        <PostFooter isMobile comment={commentData} isDetail={isDetail} />
      </div>
    </article>
  );
}

export default PostCard;
