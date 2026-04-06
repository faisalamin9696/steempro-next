"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { sdsApi } from "@/libs/sds";
import ShortsPlayer from "@/components/shorts/ShortsPlayer";
import { useSession } from "next-auth/react";
import { extractVideoUrl, ShortsPlayerInstance } from "../../page";
import { useAppSelector } from "@/hooks/redux/store";
import { isSteemProShort } from "@/utils";
import ShortPlayerSkeleton from "@/components/skeleton/ShortPlayerSkeleton";

export default function SingleShortPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [short, setShort] = useState<ShortVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const author = decodeURIComponent(params.author as string).replace("@", "");
  const permlink = params.permlink as string;
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
      <div className="h-full w-full">
        {loading && !commentData ? (
          <div className="h-full w-full flex flex-col items-center justify-center">
            <ShortPlayerSkeleton />
          </div>
        ) : (
          <div className="flex flex-col items-center w-full ">
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
