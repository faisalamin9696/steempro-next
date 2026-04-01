"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { sdsApi } from "@/libs/sds";
import ShortPlayer from "@/components/shorts/ShortPlayer";
import { useSession } from "next-auth/react";
import { Constants } from "@/constants";
import { isSteemProShort } from "@/utils";
import ShortPlayerSkeleton from "@/components/skeleton/ShortPlayerSkeleton";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/virtual";
import { useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { useDeviceInfo } from "@/hooks/redux/useDeviceInfo";

interface ShortVideo extends Feed {
  videoUrl?: string;
}

export default function ShortsPage({ author }: { author?: string }) {
  const [shorts, setShorts] = useState<ShortVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const { data: session } = useSession();
  const router = useRouter();
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const { isMobile } = useDeviceInfo();

  const isFetching = useRef(false);
  const hasMore = useRef(true);

  const loadShorts = useCallback(
    async (currentOffset = 0) => {
      if (isFetching.current || !hasMore.current) return;
      try {
        isFetching.current = true;
        setLoading(true);

        const limit = 20;
        // Fetch posts under #shorts tag
        const posts = author
          ? await sdsApi.getSteemShortsByAuthor(
              author,
              session?.user?.name || "steem",
              limit,
              currentOffset,
            )
          : await sdsApi.getSteemShorts(
              session?.user?.name || "steem",
              limit,
              currentOffset,
            );

        if (posts.length < limit) {
          hasMore.current = false;
        }

        const videoPosts = posts
          .filter((p) => {
            // Filter out muted shorts
            const isMuted = p.is_muted || p.is_author_muted;
            return isSteemProShort(p) && !isMuted;
          })
          .map((p) => ({ ...p, videoUrl: extractVideoUrl(p) }) as ShortVideo);

        setShorts((prev) => {
          // Create a map to filter out duplicates if we're rapidly paging
          const newArr = [...prev, ...videoPosts];
          const unique = newArr.filter(
            (v, i, a) => a.findIndex((t) => t.link_id === v.link_id) === i,
          );
          return unique;
        });
        setOffset(currentOffset + limit);
      } catch (error) {
        console.error("Failed to load shorts:", error);
      } finally {
        isFetching.current = false;
        setLoading(false);
      }
    },
    [session?.user?.name],
  );

  const handleRefresh = useCallback(async () => {
    hasMore.current = true;
    setOffset(0);
    setShorts([]);
    await loadShorts(0);
  }, [loadShorts]);

  useEffect(() => {
    loadShorts();
  }, [loadShorts]);

  // Load more when reaching near bottom
  useEffect(() => {
    if (shorts.length > 0 && activeVideoIndex >= shorts.length - 2) {
      loadShorts(offset);
    }
  }, [activeVideoIndex, shorts.length, loadShorts, offset]);

  return (
    <div className="relative h-dvh md:h-[calc(100vh-64px)] w-full overflow-hidden flex justify-center pb-0 md:pb-0">
      <div className="h-full w-full max-w-[500px] md:max-w-none relative transition-all duration-500">
        {loading && shorts.length === 0 ? (
          <div className="h-full w-full flex flex-col">
            <ShortPlayerSkeleton />
          </div>
        ) : (
          <Swiper
            direction="vertical"
            className="h-full w-full"
            onSlideChange={(swiper) => setActiveVideoIndex(swiper.activeIndex)}
            onSliderMove={(swiper) => {
              if (
                swiper.activeIndex === 0 &&
                swiper.translate > 100 &&
                !isFetching.current
              ) {
                handleRefresh();
              }
            }}
            modules={[Mousewheel, A11y]}
            mousewheel={true}
            slidesPerView={isMobile ? 1 : 1.06}
            spaceBetween={isMobile ? 0 : 12}
            speed={400}
          >
            {shorts.map((short, index) => (
              <SwiperSlide
                key={short.link_id}
                virtualIndex={index}
                className={twMerge("w-full relative", "pb-14 md:pb-0")}
              >
                <ShortPlayer
                  short={short}
                  isActive={index === activeVideoIndex}
                  onBack={() => router.back()}
                  shouldPreload={
                    index > activeVideoIndex && index <= activeVideoIndex + 4
                  }
                />
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        {isFetching.current && activeVideoIndex === 0 && offset === 0 && (
          <div className="absolute top-4 inset-x-0 z-50 flex justify-center pointer-events-none">
            <div className="w-full flex flex-col md:flex-row md:flex-nowrap md:justify-center md:gap-4 md:px-4">
              {/* Identity Space Spacer */}
              <div className="hidden xl:flex shrink-0 w-[240px]" />
              {/* Alert Stage */}
              <div className="shrink-0 w-full md:max-w-[500px] flex justify-center">
                <span className="bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white border border-white/5 animate-pulse">
                  Refreshing...
                </span>
              </div>
              {/* Actions Space Spacer */}
              <div className="hidden md:flex shrink-0 w-16" />
            </div>
          </div>
        )}

        {loading && shorts.length > 0 && activeVideoIndex !== 0 && (
          <div className="absolute bottom-4 inset-x-0 z-50 flex justify-center pointer-events-none">
            <div className="w-full flex flex-col md:flex-row md:flex-nowrap md:justify-center md:gap-4 md:px-4">
              {/* Identity Space Spacer */}
              <div className="hidden xl:flex shrink-0 w-[240px]" />
              {/* Alert Stage */}
              <div className="shrink-0 w-full md:max-w-[500px] flex justify-center">
                <span className="bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white border border-white/5 animate-pulse">
                  Loading More...
                </span>
              </div>
              {/* Actions Space Spacer */}
              <div className="hidden md:flex shrink-0 w-16" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const extractVideoUrl = (post: Feed): string | undefined => {
  try {
    const meta = JSON.parse(post.json_metadata || "{}");
    if (!meta?.video) return undefined;
    const v =
      typeof meta.video === "string"
        ? meta.video
        : Array.isArray(meta.video)
          ? meta.video[0]
          : null;
    if (!v) return undefined;

    if (v.startsWith("http")) return v;

    // Resolve as HLS if metadata flag is present
    const baseGateway = Constants.ipfs_gateway;
    if (meta?.isHls) {
      return `${baseGateway}/ipfs/${v}/master.m3u8`;
    }

    return `${baseGateway}/ipfs/${v}`;
  } catch {
    return undefined;
  }
};
