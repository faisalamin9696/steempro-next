import moment from "moment";
import SAvatar from "../ui/SAvatar";
import SUsername from "../ui/SUsername";
import { twMerge } from "tailwind-merge";
import PostLink from "../post/PostLink";
import ShortBody from "../post/body/ShortBody";

interface Props {
  short: ShortVideo;
  isSidebar?: boolean;
}

export default function ShortsOverlayInfo({ short, isSidebar }: Props) {
  const meta = (() => {
    try {
      return JSON.parse(short.json_metadata || "{}");
    } catch {
      return {};
    }
  })();

  const tags = (Array.isArray(meta.tags) ? meta.tags : [])
    .filter((t: string) => t !== "shorts" && t !== "steemshorts")
    .slice(0, 4);

  const reputation = Math.round(Number(short.author_reputation || 25));

  return (
    <div
      className={twMerge(
        "relative flex flex-col gap-3 z-10 pointer-events-none",
        isSidebar
          ? "p-0"
          : "p-4 text-white",
      )}
    >
      <div className="flex items-center gap-3 pointer-events-auto">
        <SAvatar
          username={short.author}
          radius="full"
          size={"sm"}
          className={twMerge(
            "border-1 shadow-sm",
            isSidebar ? "border-default-200" : "border-white/20",
          )}
        />

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <SUsername
              username={`@${short.author}`}
              className={twMerge(
                "font-semibold text-sm",
                !isSidebar && "drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]",
              )}
            />
            <span
              className={twMerge(
                "text-xs px-1 rounded font-bold border",
                isSidebar
                  ? "bg-default-100 border-default-200 text-default-600"
                  : "bg-white/20 border-white/10 text-white",
                !isSidebar && " text-shadow-sm",
              )}
            >
              {reputation}
            </span>
          </div>
          <span
            className={twMerge(
              "text-[11px] font-semibold tracking-widest opacity-80",
              !isSidebar && "drop-shadow-sm text-white",
            )}
          >
            {moment.unix(short.created).fromNow()}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 pointer-events-auto max-w-[85%] md:max-w-full">
        <h3
          className={twMerge(
            "font-semibold text-base leading-tight line-clamp-1",
            !isSidebar && "drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]",
          )}
        >
          <PostLink
            comment={short}
            title={short.title}
            className="line-clamp-1 self-start w-fit"
          />
        </h3>

        <ShortBody body={short.body} className="line-clamp-1"/>
        {/* {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {tags.map((tag: string) => (
              <span
                key={tag}
                className={twMerge(
                  "text-[10px] px-2 py-0.5 rounded-full font-bold border",
                  isSidebar
                    ? "bg-default-100 border-default-200 text-default-600"
                    : "bg-white/10 backdrop-blur-md border-white/30 drop-shadow-sm text-white",
                  !isSidebar && " text-shadow-sm",
                )}
              >
                #{tag}
              </span>
            ))}
          </div>
        )} */}
      </div>
    </div>
  );
}
