import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Volume2, VolumeX, Play, ChevronLeft } from "lucide-react";
import { Button } from "@heroui/button";
import ShortActions from "./ShortActions";
import ShortOverlayInfo from "./ShortOverlayInfo";
import { getThumbnail } from "@/utils/image";
import { useAppDispatch, useAppSelector } from "@/hooks/redux/store";
import { addCommonDataHandler } from "@/hooks/redux/reducers/CommonReducer";
import VideoJS from "./VideoPlayer";
import NsfwOverlay from "../nsfw/NsfwOverlay";
import { hasNsfwTag } from "@/utils";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "framer-motion";

interface ShortPlayerProps {
  short: ShortVideo;
  isActive: boolean;
  shouldPreload?: boolean;
  onBack?: () => void;
}

export default function ShortPlayer({
  short,
  isActive,
  shouldPreload,
  onBack,
}: ShortPlayerProps) {
  const playerRef = useRef<any>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isHoveringBar, setIsHoveringBar] = useState(false);
  const [isUiVisible, setIsUiVisible] = useState(true);
  const [showMuteOverlay, setShowMuteOverlay] = useState(false);

  const isMuted = useAppSelector(
    (state) => state.commonReducer.values.isShortsMuted,
  );
  const shortsResolution = useAppSelector(
    (state) => state.commonReducer.values.shortsResolution,
  );
  const commentData =
    useAppSelector(
      (s) => s.commentReducer.values[`${short.author}/${short.permlink}`],
    ) ?? short;

  // --- Core Handlers ---
  const togglePlay = useCallback((e?: React.MouseEvent | KeyboardEvent) => {
    e?.stopPropagation();
    const player = playerRef.current;
    if (!player || typeof player.paused !== "function") return;

    if (player.paused()) {
      player.play()?.catch(() => setIsPlaying(false));
    } else {
      player.pause();
    }
  }, []);

  const toggleMute = useCallback(
    (e?: React.MouseEvent | KeyboardEvent) => {
      e?.stopPropagation();
      const player = playerRef.current;
      const nextMuted = !isMuted;
      dispatch(addCommonDataHandler({ isShortsMuted: nextMuted }));
      if (player) player.muted?.(nextMuted);
      setShowMuteOverlay(true);
      setTimeout(() => setShowMuteOverlay(false), 800);
    },
    [dispatch, isMuted],
  );

  // --- Keyboard Support ---
  useEffect(() => {
    if (!isActive) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay(e);
      }
      if (e.code === "KeyM") {
        e.preventDefault();
        toggleMute(e);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, togglePlay, toggleMute]);

  const thumbnail = useMemo(
    () => getThumbnail(commentData.json_images, "640x0"),
    [commentData.json_images],
  );

  const videoJsOptions = useMemo(
    () => ({
      autoplay: false,
      controls: false,
      muted: isMuted,
      preload: isActive ? "auto" : shouldPreload ? "metadata" : "none",
      loop: true,
      responsive: true,
      fluid: false,
      disablePictureInPicture: true,
      sources: [
        {
          src: short?.videoUrl,
          type: short?.videoUrl?.includes(".m3u8")
            ? "application/x-mpegURL"
            : "video/mp4",
        },
      ],
    }),
    [short.videoUrl, isMuted, isActive, shouldPreload],
  );

  const seek = useCallback((e: React.PointerEvent | PointerEvent) => {
    const player = playerRef.current;
    const bar = progressBarRef.current;
    if (!player || !bar) return;

    const rect = bar.getBoundingClientRect();
    const x = ("clientX" in e ? e.clientX : (e as any).clientX) - rect.left;
    const p = Math.max(0, Math.min(1, x / rect.width));
    const d = player.duration();
    if (d > 0) {
      player.currentTime(p * d);
      setProgress(p * 100);
    }
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.stopPropagation();
      setIsSeeking(true);
      seek(e);
    },
    [seek],
  );

  useEffect(() => {
    if (!isSeeking) return;
    const onPointerMove = (e: PointerEvent) => seek(e);
    const onPointerUp = () => setIsSeeking(false);

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [isSeeking, seek]);

  const handlePlayerReady = useCallback(
    (player: any) => {
      playerRef.current = player;

      player.poster(thumbnail || "");
      // player.one("playing", () => player.poster(""));

      // ✅ Autoplay if already active
      if (isActive) {
        player.play()?.catch(() => {});
      }

      player.on("playing", () => {
        setIsLoading(false);
        setIsPlaying(true);
      });
      player.on("canplay", () => setIsLoading(false));
      player.on("waiting", () => setIsLoading(true));
      player.on("pause", () => setIsPlaying(false));
      player.on("timeupdate", () => {
        const d = player.duration();
        const c = player.currentTime();
        if (d > 0) {
          const nextP = (c / d) * 100;
          setProgress((prev) => (Math.abs(prev - nextP) > 0.3 ? nextP : prev));
        }
      });

      player.on("loadedmetadata", () => {
        try {
          // Official VHS (Video.js HTTP Streaming) API for quality steering
          const vhs =
            player.vhs ||
            (player.tech({ IWillNotUseThisInPlugins: true }) as any)?.vhs;
          if (vhs && typeof vhs.representations === "function") {
            if (shortsResolution !== "auto") {
              const levels = vhs.representations();
              const target =
                shortsResolution === "high"
                  ? [...levels].sort((a: any, b: any) => b.height - a.height)[0]
                  : [...levels].sort(
                      (a: any, b: any) => a.height - b.height,
                    )[0];
              if (target)
                vhs.representations().forEach((rep: any) => {
                  rep.enabled(rep.id === target.id);
                });
            }
          }
        } catch (e) {}
      });

      player.ready(() => {
        const videoEl = player.el().querySelector("video") as HTMLVideoElement;
        const wrapper = videoEl?.parentElement;
        if (videoEl && wrapper) {
          videoEl.style.width = "100%";
          videoEl.style.height = "100%";
          videoEl.style.objectFit = "cover";
          videoEl.style.touchAction = "manipulation";
          wrapper.style.width = "100%";
          wrapper.style.height = "100%";
          wrapper.style.pointerEvents = "none";
        }
      });
    },
    [thumbnail, shortsResolution, playerRef, isActive],
  );

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    if (isActive) {
      const timer = setTimeout(() => {
        if (player && !player.isDisposed?.()) {
          player.play()?.catch(() => {});
        }
      }, 50);
      return () => clearTimeout(timer);
    } else {
      if (typeof player.pause === "function" && !player.isDisposed?.()) {
        player.pause();
        if (!shouldPreload) player.currentTime(0);
      }
    }
  }, [isActive, shouldPreload]);

  // --- UI Interactivity ---
  useEffect(() => {
    if (!isActive) return;
    let timeoutId: any;
    const resetTimer = () => {
      setIsUiVisible(true);
      clearTimeout(timeoutId);
      if (isPlaying) {
        timeoutId = setTimeout(() => setIsUiVisible(false), 3000);
      }
    };

    resetTimer();

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("touchstart", resetTimer);

    return () => {
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("touchstart", resetTimer);
      clearTimeout(timeoutId);
    };
  }, [isActive, isPlaying]);

  const nsfw = useMemo(() => hasNsfwTag(commentData), [commentData]);
  // Generate a unique key for the video player
  const videoPlayerKey = useMemo(() => {
    return `${short.videoUrl}-${isActive}`;
  }, [short.videoUrl, isActive]);

  return (
    <div className="h-full w-full flex flex-col py-2 md:flex-row md:flex-nowrap md:items-end md:justify-center md:gap-4 md:px-4 md:pb-4">
      {/* --- DESKTOP ONLY: Left Sidebar (Identity) --- */}
      <div
        className={twMerge(
          "hidden xl:flex shrink-0 flex-col items-start justify-end h-full w-[240px] gap-4 pb-12 transition-all duration-700 pointer-events-auto",
          !isActive
            ? "opacity-0 translate-x-[-20px] pointer-events-none"
            : "animate-in slide-in-from-left-8",
        )}
      >
        <ShortOverlayInfo short={commentData} isSidebar />
      </div>

      {/* Immersive Center Stage (Fixed 500px) */}
      <div
        ref={containerRef}
        className={twMerge(
          "shrink-0 h-full w-full md:max-w-[500px] rounded-2xl bg-zinc-900 group relative flex items-center justify-center overflow-hidden shadow-2xl shadow-black/40 border border-white/5 transition-all duration-500",
          !isActive && "brightness-50 grayscale-[0.2]",
        )}
        onClick={togglePlay}
      >
        <NsfwOverlay isNsfw={nsfw} className="h-full w-full">
          <VideoJS
            key={videoPlayerKey} // Add key prop to force re-initialization
            options={videoJsOptions}
            onReady={handlePlayerReady}
          />
        </NsfwOverlay>

        {/* Unified High-Fidelity Interaction Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <AnimatePresence mode="popLayout">
            {((!isPlaying && !isLoading && isActive) || showMuteOverlay) && (
              <motion.div
                key="interaction-overlay"
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 450, damping: 25 }}
                className="flex flex-row items-center gap-8 p-4 bg-black/40 backdrop-blur-md rounded-full border border-white/10 shadow-2xl"
              >
                {/* Play/Pause Status */}
                {!isPlaying && !isLoading && isActive && !showMuteOverlay && (
                  <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 10, opacity: 0 }}
                  >
                    <Play className="text-white w-10 h-10 fill-white" />
                  </motion.div>
                )}

                {/* Mute/Unmute Status */}
                {showMuteOverlay && (
                  <motion.div
                    initial={{ x: 10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -10, opacity: 0 }}
                  >
                    {isMuted ? (
                      <VolumeX size={40} className="text-white fill-white/20" />
                    ) : (
                      <Volume2 size={40} className="text-white fill-white/20" />
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Global Loading Spinner */}
            {isLoading && isActive && (
              <motion.div
                key="loading-spinner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="w-14 h-14 border-4 border-white/20 border-t-white rounded-full animate-spin shadow-xl" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Toolbar: Right side floating buttons */}
        <div
          className={twMerge(
            "absolute top-4 right-4 z-20 flex flex-col gap-3 transition-opacity duration-500",
            (!isUiVisible || !isActive) && "opacity-0",
          )}
        >
          <Button
            isIconOnly
            radius="full"
            variant="flat"
            className="bg-black/40 text-white pointer-events-auto"
            onClick={(e) => toggleMute(e as any)}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </Button>
        </div>

        {/* --- MOBILE ONLY: Overlays (Hidden on Desktop) --- */}
        <div
          className={twMerge(
            "absolute inset-x-0 bottom-0 pointer-events-none transition-opacity duration-500 xl:hidden",
            (!isUiVisible || !isActive) && "opacity-0",
          )}
        >
          <div className="absolute bottom-0 inset-x-0 h-48 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
          <ShortOverlayInfo short={commentData} />
        </div>

        {/* Short Actions (Mobile) */}
        <div
          className={twMerge(
            "absolute bottom-20 backdrop-blur-xs right-2 z-20 transition-opacity duration-500 md:hidden text-white",
            (!isUiVisible || !isActive) && "opacity-0",
          )}
        >
          <ShortActions short={commentData} />
        </div>

        {/* Navigation Back (Mobile) */}
        <div className="absolute top-4 left-4 z-20 md:hidden">
          <Button
            isIconOnly
            radius="full"
            variant="flat"
            className="bg-black/40 text-white"
            onClick={onBack}
          >
            <ChevronLeft size={20} />
          </Button>
        </div>

        {/* --- Progress Bar --- */}
        {/* Progress / Seek Bar */}
        <div
          ref={progressBarRef}
          className={twMerge(
            "absolute bottom-2 left-3 right-3 z-40 cursor-pointer touch-none transition-all group-hover:h-2 h-1",
            (isHoveringBar || isSeeking) && isActive ? "h-2" : "h-1",
            !isActive && "opacity-10",
          )}
          onPointerDown={handlePointerDown}
          onPointerMove={isSeeking ? (e) => seek(e) : undefined}
          onPointerUp={() => setIsSeeking(false)}
          onMouseEnter={() => setIsHoveringBar(true)}
          onMouseLeave={() => setIsHoveringBar(false)}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative w-full h-full bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-none rounded-full"
              style={{ width: `${progress}%` }}
            />
            {(isHoveringBar || isSeeking) && isActive && (
              <div
                className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-xl"
                style={{ left: `${progress}%`, marginLeft: "-7px" }}
              />
            )}
          </div>
        </div>
      </div>

      {/* --- DESKTOP ONLY: Right Sidebar (Actions) --- */}
      <div
        className={twMerge(
          "hidden md:flex backdrop-blur-xs flex-col items-center justify-end h-full w-[80px] pb-12 gap-6 transition-all duration-700 delay-100",
          !isActive
            ? "opacity-0 translate-y-[20px] pointer-events-none"
            : "animate-in slide-in-from-bottom-8",
        )}
      >
        <ShortActions short={commentData} />
      </div>
    </div>
  );
}
