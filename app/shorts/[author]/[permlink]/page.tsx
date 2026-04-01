"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { sdsApi } from "@/libs/sds";
import ShortPlayer from "@/components/shorts/ShortPlayer";
import { useSession } from "next-auth/react";
import { extractVideoUrl } from "../../page";
import { useAppSelector } from "@/hooks/redux/store";
import { isSteemProShort } from "@/utils";
import ShortPlayerSkeleton from "@/components/skeleton/ShortPlayerSkeleton";

export default function SingleShortPage() {
  const params = useParams();
  const router = useRouter();
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

  // if (!commentData) {
  //   return (
  //     <div className="h-screen w-full flex flex-col items-center justify-center text-white gap-4">
  //       <p>Short not found or not a valid video.</p>
  //       <Button onPress={() => router.push("/shorts")} color="primary">
  //         Go back to Shorts
  //       </Button>
  //     </div>
  //   );
  // }

  return (
    <div className="relative h-dvh md:h-[calc(100vh-64px)] w-full overflow-hidden flex justify-center pb-0 md:pb-0">
      <div className="h-full w-full max-w-[500px] md:max-w-none relative transition-all duration-500">
        {loading ? (
          <div className="h-full w-full flex flex-col">
            <ShortPlayerSkeleton />
          </div>
        ) : (
          <ShortPlayer
            short={{ ...commentData, videoUrl: short?.videoUrl }}
            isActive={true}
            onBack={() => router.push("/shorts")}
          />
        )}
      </div>
    </div>
  );
}
