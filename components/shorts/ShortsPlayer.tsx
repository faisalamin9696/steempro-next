import { useEffect, useMemo, memo } from "react";
import { getThumbnail } from "@/utils/image";
import { useAppSelector } from "@/hooks/redux/store";
import NsfwOverlay from "../nsfw/NsfwOverlay";
import { hasNsfwTag } from "@/utils";
import ShortsActions from "./ShortsActions";
import ShortsOverlayInfo from "./ShortsOverlayInfo";
import { twMerge } from "tailwind-merge";
import { ShortsPlayerInstance } from "@/app/shorts/page";
import VideoPlayer from "./VideoPlayer";

interface ShortsPlayer {
  short: ShortVideo;
  isActive: boolean;
  shouldPreload?: boolean;
}

export default memo(function ShortsPlayerEnhanced({
  short,
  isActive,
  shouldPreload,
}: ShortsPlayer) {
  const player = ShortsPlayerInstance.usePlayer().target;
  // const [isUiVisible, setIsUiVisible] = useState(true);

  const commentData =
    useAppSelector(
      (s) => s.commentReducer.values[`${short.author}/${short.permlink}`],
    ) ?? short;

  const thumbnail = useMemo(
    () => getThumbnail(commentData.json_images, "640x0") || undefined,
    [commentData.json_images],
  );

  const nsfw = useMemo(() => hasNsfwTag(commentData), [commentData]);

  // Feed-Lifecycle Synchronization (Critical for silencing ghost-audio)
  useEffect(() => {
    if (!player) return;
    if (isActive) {
      player?.media?.play()?.catch(() => {});
    } else {
      player?.media?.pause();
    }
  }, [isActive, player]);

  // Adaptive UI Visibility Logic (Minified)
  // useEffect(() => {
  //   if (!isActive || !player?.media) return;
  //   let t: NodeJS.Timeout;
  //   const hide = () => {
  //     clearTimeout(t);
  //     !player.media.paused &&
  //       (t = setTimeout(() => setIsUiVisible(false), 3000));
  //   };
  //   const show = () => {
  //     setIsUiVisible(true);
  //     hide();
  //   };
  //   const evs = [
  //     "mousemove",
  //     "mousedown",
  //     "touchstart",
  //     "touchmove",
  //     "keydown",
  //   ];
  //   const h = () => show();

  //   hide();
  //   evs.forEach((e) => window.addEventListener(e, h));
  //   player.media.addEventListener("play", hide);
  //   player.media.addEventListener("pause", h);

  //   return () => {
  //     clearTimeout(t);
  //     evs.forEach((e) => window.removeEventListener(e, h));
  //     player.media?.removeEventListener("play", hide);
  //     player.media?.removeEventListener("pause", h);
  //   };
  // }, [isActive, player]);

  // const visibilityClass = useMemo(
  //   () =>
  //     twMerge(
  //       "transition-opacity duration-500",
  //       !isUiVisible && isActive
  //         ? "opacity-0 pointer-events-none"
  //         : "opacity-100 pointer-events-auto",
  //     ),
  //   [isUiVisible, isActive],
  // );

  return (
    <div className="h-full w-full flex py-0 md:py-2 flex-row items-end justify-center px-0 md:px-4 md:pb-4 overflow-hidden relative">
      {/* Sidebar Info (Desktop) */}
      <div className="hidden md:flex flex-1 flex-col items-end justify-end h-full pb-12 pointer-events-none">
        <div
          className={twMerge(
            "hidden xl:flex flex-col items-start w-full px-4 transition-all duration-700",
            !isActive
              ? "opacity-0 translate-x-[-20px]"
              : "animate-in slide-in-from-left-8 pointer-events-auto",
          )}
        >
          <ShortsOverlayInfo short={commentData} isSidebar />
        </div>
      </div>

      {/* Center Media Stage */}
      <div
        className={twMerge(
          "shrink-0 h-full w-full md:max-w-[500px] rounded-none group relative flex items-center justify-center overflow-hidden shadow-2xl transition-all duration-500",
          !isActive && "brightness-50 grayscale-[0.2]",
        )}
      >
        <NsfwOverlay isNsfw={nsfw} className="h-full w-full">
          <VideoPlayer
            poster={thumbnail}
            autoPlay={false}
            src={short?.videoUrl}
            playsInline
            isActive={isActive}
            loop
            disablePictureInPicture
            preload={shouldPreload ? "auto" : "none"}
            customContent={
              <div
                className={twMerge(
                  "xl:hidden transition-opacity duration-500",
                  // visibilityClass
                )}
              >
                <ShortsOverlayInfo short={commentData} />
              </div>
            }
          />
        </NsfwOverlay>

        {/* Mobile Actions Overlay */}
        <div
          className={twMerge(
            "absolute bottom-34 right-2 z-20 transition-opacity duration-500 md:hidden",
            !isActive && "opacity-0",
            // visibilityClass,
          )}
        >
          <ShortsActions short={commentData} />
        </div>
      </div>

      {/* Action Sidebar (Desktop) */}
      <div className="hidden md:flex flex-1 flex-col items-start justify-end h-full pb-12 pointer-events-none">
        <div
          className={twMerge(
            "flex flex-col items-center w-[80px] px-2 gap-6 transition-all duration-700 delay-100 pointer-events-auto",
            !isActive
              ? "opacity-0 translate-y-[20px]"
              : "animate-in slide-in-from-bottom-8",
          )}
        >
          <ShortsActions short={commentData} />
        </div>
      </div>
    </div>
  );
});
