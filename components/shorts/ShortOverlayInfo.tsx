import moment from "moment";
import SAvatar from "../ui/SAvatar";
import SUsername from "../ui/SUsername";
import { Button } from "@heroui/button";
import { Plus } from "lucide-react";
import { twMerge } from "tailwind-merge";
import PostLink from "../post/PostLink";

interface Props {
  short: any;
  isSidebar?: boolean;
}

export default function ShortOverlayInfo({ short, isSidebar }: Props) {
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
          ? "p-3"
          : "p-6 pt-20 pb-10 text-white bg-linear-to-t from-black/80 via-black/20 to-transparent",
      )}
    >
      <div className="flex items-center gap-3 pointer-events-auto">
        <div className="relative">
          <SAvatar
            username={short.author}
            radius="full"
            size={"sm"}
            className={twMerge(
              "border-2 shadow-lg",
              isSidebar ? "border-default-200" : "border-white/20",
            )}
          />
          <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-0.5 border border-black hidden">
            <Plus size={10} className="text-white" />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <SUsername
                username={`@${short.author}`}
                className={twMerge(
                  "font-bold text-base",
                  !isSidebar && "drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]",
                )}
              />
              <span
                className={twMerge(
                  "text-[10px] px-1 rounded font-bold border",
                  isSidebar
                    ? "bg-default-100 border-default-200 text-default-600"
                    : "bg-white/20 border-white/10 text-white",
                )}
              >
                {reputation}
              </span>
            </div>
          </div>
          <span
            className={twMerge(
              "text-[10px] uppercase font-semibold tracking-widest opacity-80",
              !isSidebar && "drop-shadow-md text-white",
            )}
          >
            {moment.unix(short.created).fromNow()}
          </span>
        </div>
      </div>

      <div className="space-y-2 pointer-events-auto max-w-[85%] md:max-w-full">
        <h3
          className={twMerge(
            "font-semibold text-base leading-tight line-clamp-2",
            !isSidebar && "drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]",
          )}
        >
          <PostLink comment={short} title={short.title} />
        </h3>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {tags.map((tag: string) => (
              <span
                key={tag}
                className={twMerge(
                  "text-[10px] px-2 py-0.5 rounded-full font-bold border",
                  isSidebar
                    ? "bg-default-100 border-default-200 text-default-600"
                    : "bg-white/10 backdrop-blur-md border-white/5 drop-shadow-sm text-white",
                )}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
