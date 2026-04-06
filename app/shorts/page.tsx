"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { sdsApi } from "@/libs/sds";
import { useSession } from "next-auth/react";
import { isSteemProShort } from "@/utils";
import ShortPlayerSkeleton from "@/components/skeleton/ShortPlayerSkeleton";
import { twMerge } from "tailwind-merge";
import { createPlayer, videoFeatures } from "@videojs/react";
import { Constants } from "@/constants";
import ShortsPlayer from "@/components/shorts/ShortsPlayer";
import { useAppSelector } from "@/hooks/redux/store";

interface ShortVideo extends Feed {
  videoUrl?: string;
}

export const ShortsPlayerInstance = createPlayer({
  features: videoFeatures,
});

export default function ShortsPage({ author }: { author?: string }) {
  const [shorts, setShorts] = useState<ShortVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const { data: session } = useSession();
  const isFetching = useRef(false);
  const hasMore = useRef(true);
  const offsetRef = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const loadShorts = useCallback(
    async (reset = false) => {
      if (isFetching.current || (!hasMore.current && !reset)) return;
      try {
        if (reset) {
          offsetRef.current = 0;
          hasMore.current = true;
          setShorts([]);
        }
        isFetching.current = true;
        setLoading(true);
        const limit = 10;
        const posts =
          (author
            ? await sdsApi.getSteemShortsByAuthor(
                author,
                session?.user?.name || "steem",
                limit,
                offsetRef.current,
              )
            : await sdsApi.getSteemShorts(
                session?.user?.name || "steem",
                limit,
                offsetRef.current,
              )) ?? [];

        if (posts.length < limit) {
          hasMore.current = false;
        }

        const videoPosts = posts
          .filter((p) => {
            const isMuted = p.is_muted || p.is_author_muted;
            return isSteemProShort(p) && !isMuted;
          })
          .map((p) => ({ ...p, videoUrl: extractVideoUrl(p) }) as ShortVideo);

        setShorts((prev) => {
          const novel = videoPosts.filter(
            (p) => !prev.some((x) => x.link_id === p.link_id),
          );
          return [...prev, ...novel];
        });
        offsetRef.current += limit;
      } catch (error) {
        console.error("Failed to load shorts:", error);
      } finally {
        isFetching.current = false;
        setLoading(false);
      }
    },
    [author, session?.user?.name],
  );

  useEffect(() => {
    loadShorts(true);
  }, [loadShorts]);

  const scrollState = useRef({
    ticking: false,
  });

  // Global IntersectionObserver for guaranteed flawless active index detection
  useEffect(() => {
    if (!scrollContainerRef.current || shorts.length === 0) return;

    // Single observer instance eliminates heavy memory leaks and mathematical drift
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-index"));
            setActiveVideoIndex(idx);
          }
        });
      },
      {
        root: scrollContainerRef.current,
        threshold: 0.6, // Element must be at least 60% visible to flip the switch
      },
    );

    // Discover all freshly mapped wrappers securely
    const slides = scrollContainerRef.current.querySelectorAll(".shorts-slide");
    slides.forEach((slide) => observer.observe(slide));

    return () => observer.disconnect();
  }, [shorts.length]);

  const handleScroll = useCallback(() => {
    if (
      !scrollContainerRef.current ||
      shorts.length === 0 ||
      scrollState.current.ticking
    )
      return;

    scrollState.current.ticking = true;
    requestAnimationFrame(() => {
      const container = scrollContainerRef.current;
      if (!container) {
        scrollState.current.ticking = false;
        return;
      }

      const slideHeight = container.clientHeight;
      if (slideHeight <= 0) {
        scrollState.current.ticking = false;
        return;
      }

      // Secure Native Infinite Load Engine
      const scrollPosition = container.scrollTop + slideHeight;
      const threshold = container.scrollHeight - slideHeight * 3; // Trigger 3 slides early

      if (
        scrollPosition > threshold &&
        hasMore.current &&
        !isFetching.current
      ) {
        loadShorts();
      }

      scrollState.current.ticking = false;
    });
  }, [shorts.length, loadShorts]);

  return (
    <div className="relative h-dvh md:h-[calc(100vh-64px)] w-full overflow-hidden flex justify-center ">
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="h-full w-full relative overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      >
        {loading && shorts.length === 0 ? (
          <div className="h-full w-full flex flex-col items-center justify-center pb-14 md:pb-0">
            <ShortPlayerSkeleton />
          </div>
        ) : (
          <div className="flex flex-col items-center w-full">
            {shorts.map((short, index) => {
              // Smart Virtualization: Render active + neighbors
              const isAround = Math.abs(index - activeVideoIndex) <= 2; // Expanded window prevents jitter

              return (
                <div
                  key={short.link_id}
                  data-index={index}
                  className={twMerge(
                    "shorts-slide h-dvh md:h-[calc(100vh-64px)] w-full snap-start snap-always shrink-0 flex items-center justify-center relative pb-14 md:pb-0",
                  )}
                >
                  {isAround ? (
                    <ShortsPlayerInstance.Provider>
                      <ShortsPlayer
                        short={short}
                        isActive={index === activeVideoIndex}
                        shouldPreload={true}
                      />
                    </ShortsPlayerInstance.Provider>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}

        {/* Refreshing Indicator */}
        {isFetching.current && offsetRef.current === 0 && (
          <div className="absolute top-6 inset-x-0 z-50 flex justify-center pointer-events-none">
            <span className="bg-black/40 backdrop-blur-md px-5 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] text-white/90 border border-white/10 animate-pulse shadow-xl">
              Refreshing...
            </span>
          </div>
        )}

        {/* Loading Indicator at Bottom perfectly overlaid to video */}
        {loading && shorts?.length > 0 && activeVideoIndex !== 0 && (
          <div className="absolute bottom-8 inset-x-0 z-50 flex justify-center pointer-events-none">
            <span className="bg-black/40 backdrop-blur-md px-5 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] text-white/90 border border-white/10 animate-pulse shadow-xl">
              Loading More...
            </span>
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
