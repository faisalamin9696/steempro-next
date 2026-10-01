"use client";

import { useEffect, useState } from "react";
import { sdsApi } from "@/libs/sds";
import ShortsPlayer from "@/components/shorts/ShortsPlayer";
import { useSession } from "next-auth/react";
import { ShortsPlayerInstance } from "../../page";
import { useAppSelector } from "@/hooks/redux/store";
import { isSteemProShort } from "@/utils";
import { extractVideoUrl } from "@/utils/shorts";
import ShortPlayerSkeleton from "@/components/skeleton/ShortPlayerSkeleton";

type ShortVideo = Feed & { videoUrl?: string };

/**
 * The player for a single short.
 *
 * `initialPost` is what the server already fetched and rendered — without it
 * the route would return an empty document to crawlers. The effect below still
 * refetches so observer-specific fields (vote state) update once the session
 * resolves, exactly as before.
 */
export default function SingleShort({
  author,
  permlink,
  initialPost,
}: {
  author: string;
  permlink: string;
  initialPost: ShortVideo | null;
}) {
  const { data: session } = useSession();
  const [short, setShort] = useState<ShortVideo | null>(initialPost);
  const [loading, setLoading] = useState(!initialPost);
  const commentData =
    useAppSelector((s) => s.commentReducer.values[`${author}/${permlink}`]) ??
    short;

  useEffect(() => {
    const fetchShort = async () => {
      try {
        setLoading(true);
        const post = await sdsApi.getPost(
          author,
          permlink,
          session?.user?.name || "steem",
        );
        if (post && isSteemProShort(post)) {
          const videoUrl = extractVideoUrl(post);
          if (videoUrl) {
            setShort({ ...post, videoUrl } as ShortVideo);
          }
        }
      } catch (error) {
        console.error("Failed to fetch short:", error);
      } finally {
        setLoading(false);
      }
    };

    if (author && permlink) {
      fetchShort();
    }
  }, [author, permlink, session?.user?.name]);

  return (
    <div className="w-full h-dvh overflow-hidden flex justify-center ">
      <div className="h-[calc(100dvh-64px)] md:h-[calc(100vh-64px)] w-full shrink-0 flex items-center justify-center relative pb-14 md:pb-0">
        {loading && !commentData ? (
          <div className="h-full w-full flex flex-col items-center justify-center">
            <ShortPlayerSkeleton />
          </div>
        ) : (
          <div className="flex flex-col items-center w-full h-full">
            <ShortsPlayerInstance.Provider>
              <ShortsPlayer
                short={commentData}
                isActive={true}
                shouldPreload={true}
              />
            </ShortsPlayerInstance.Provider>
          </div>
        )}
      </div>
    </div>
  );
}
