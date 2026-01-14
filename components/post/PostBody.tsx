import Link from "next/link";
import ShortBody from "./body/ShortBody";
import { Image } from "@heroui/image";
import { twMerge } from "tailwind-merge";
import NsfwOverlay from "../nsfw/NsfwOverlay";
import { hasNsfwTag } from "@/utils";
import { getThumbnail } from "@/utils/image";
import NextImage from "next/image";

interface Props {
  comment: Feed | Post;
  layout?: FeedStyle;
}
function PostBody(props: Props) {
  const { comment, layout } = props;
  const thumbnail = getThumbnail(comment.json_images, "640x0");
  const isNsfw = hasNsfwTag(comment);

  const isReply =
    (comment?.depth ?? 0) > 0 ||
    (comment?.parent_author && comment.parent_author !== "");

  const heading = isReply
    ? `RE: ${comment?.root_title ?? comment?.title ?? ""}`
    : comment?.title;

  const isBlog = layout === "blogs";

  return (
    <div className="flex flex-col gap-2 w-full">
      <Link
        className="flex flex-col gap-3 hover:opacity-80 transition-all delay-75"
        href={`/@${comment.author}/${comment.permlink}`}
      >
        <p
          className={twMerge(
            "font-semibold hover:text-blue-500 transition-colors delay-75",
            isBlog ? "text-xl md:text-2xl" : ""
          )}
        >
          {heading}
        </p>
      </Link>

      <NsfwOverlay isNsfw={isNsfw} className="mt-1" placement="start">
        <div
          className={twMerge(
            "flex gap-3 items-start w-full",
            isBlog ? "flex-col" : "flex-row"
          )}
        >
          <div className="flex flex-col gap-2 flex-1 w-full">
            {thumbnail && (
              <Image
                className={twMerge(isBlog ? "my-4 w-full" : "sm:hidden my-4")}
                as={NextImage}
                height={0}
                width={0}
                classNames={{
                  img: isBlog
                    ? "w-full object-cover max-h-[500px]"
                    : "object-cover",
                  wrapper: isBlog ? "w-full" : "",
                }}
                src={thumbnail}
                quality={75}
                style={{
                  height: "100%",
                  width: "100%",
                }}
              />
            )}

            <Link
              className="flex flex-col gap-3 hover:opacity-80 transition-all delay-50"
              href={`/@${comment.author}/${comment.permlink}`}
            >
              <ShortBody
                length={isBlog ? 300 : 150}
                className="text-muted text-sm"
                body={comment.body}
              />
            </Link>
          </div>
          {thumbnail && !isBlog && (
            <Image
              as={NextImage}
              className={twMerge("hidden sm:block")}
              height={80}
              width={160}
              style={{
                objectFit: "cover",
              }}
              src={thumbnail}
              quality={75}
            />
          )}
        </div>
      </NsfwOverlay>
    </div>
  );
}

export default PostBody;
