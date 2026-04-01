import React, { useEffect, useRef, useMemo, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { twMerge } from "tailwind-merge";
import "./style.scss";

interface VideoJSProps {
  options: any;
  onReady?: (player: any) => void;
  className?: string;
  customContent?: React.ReactNode; // Add custom content prop
  contentPosition?: "top" | "bottom" | "center"; // Position of content
}

export const VideoJS: React.FC<VideoJSProps> = ({
  options,
  onReady,
  className,
  customContent,
  contentPosition = "bottom",
}) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const optionsRef = useRef(options);
  const onReadyRef = useRef(onReady);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  // Store latest callbacks to avoid unnecessary effect runs
  useEffect(() => {
    optionsRef.current = options;
    onReadyRef.current = onReady;
  });

  // Memoize class names
  const containerClassName = useMemo(
    () => twMerge("h-full w-full relative", className),
    [className],
  );

  // Initialize player only once
  useEffect(() => {
    if (!videoRef.current || playerRef.current) return;

    const videoElement = document.createElement("video");
    videoElement.className = "video-js vjs-big-play-centered vjs-fill";
    videoRef.current.appendChild(videoElement);

    // Add custom CSS to position content
    const style = document.createElement("style");
    style.textContent = `
      .video-js .vjs-custom-content {
        position: absolute;
        z-index: 10;
        width: 100%;
        pointer-events: none;
      }
      .video-js .vjs-custom-content-bottom {
        bottom: 80px;
        left: 0;
        right: 0;
        text-align: center;
      }
      .video-js .vjs-custom-content-top {
        top: 80px;
        left: 0;
        right: 0;
        text-align: center;
      }
      .video-js .vjs-custom-content-center {
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
      }
      /* Make sure custom content doesn't interfere with video controls */
      .video-js .vjs-custom-content * {
        pointer-events: auto;
      }
      /* Adjust big play button position if needed */
      .video-js.vjs-big-play-centered .vjs-big-play-button {
        z-index: 20;
      }
    `;
    document.head.appendChild(style);

    const player = videojs(videoElement, optionsRef.current, () => {
      setIsPlayerReady(true);
      onReadyRef.current?.(player);

      // Add custom content container after player is ready
      if (customContent) {
        const contentContainer = document.createElement("div");
        contentContainer.className = `vjs-custom-content vjs-custom-content-${contentPosition}`;
        contentContainer.id = "vjs-custom-content";

        // Find the player's control bar container
        const controlBar = player.el().querySelector(".vjs-control-bar");
        if (controlBar) {
          // Insert content above control bar
          controlBar.parentNode?.insertBefore(contentContainer, controlBar);
        } else {
          // Fallback: add to player container
          player.el().appendChild(contentContainer);
        }
      }
    });

    playerRef.current = player;

    // Cleanup function
    return () => {
      // Remove custom style
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }

      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }

      if (videoElement && videoElement.parentNode) {
        videoElement.parentNode.removeChild(videoElement);
      }
    };
  }, []); // Empty dependency array - initialize once

  // Handle custom content updates
  useEffect(() => {
    if (!isPlayerReady || !playerRef.current) return;

    const player = playerRef.current;
    const contentContainer = player.el().querySelector("#vjs-custom-content");

    if (contentContainer && customContent) {
      // Update content position class
      contentContainer.className = `vjs-custom-content vjs-custom-content-${contentPosition}`;
    }
  }, [customContent, contentPosition, isPlayerReady]);

  // Handle dynamic updates efficiently
  useEffect(() => {
    const player = playerRef.current;
    if (!player || player.isDisposed?.()) return;

    const newOptions = optionsRef.current;

    // Batch updates to avoid multiple re-renders
    const updates: Array<() => void> = [];

    // Update src only if changed
    const prevSrc = player.currentSrc();
    const newSrc = newOptions.sources?.[0]?.src;
    if (newSrc && prevSrc !== newSrc) {
      updates.push(() => player.src(newOptions.sources));
    }

    // Update other properties with batch
    if (
      typeof newOptions.muted !== "undefined" &&
      player.muted() !== newOptions.muted
    ) {
      updates.push(() => player.muted(newOptions.muted));
    }

    if (
      typeof newOptions.autoplay !== "undefined" &&
      player.autoplay() !== newOptions.autoplay
    ) {
      updates.push(() => player.autoplay(newOptions.autoplay));
    }

    // Execute updates in next frame to avoid blocking
    if (updates.length > 0) {
      requestAnimationFrame(() => {
        updates.forEach((update) => update());
      });
    }
  }, [options]);

  // Handle player ready event separately
  useEffect(() => {
    const player = playerRef.current;
    if (player && onReadyRef.current) {
      const readyHandler = () => onReadyRef.current?.(player);

      if (player.isReady_) {
        readyHandler();
      } else {
        player.ready(readyHandler);
      }
    }
  }, [onReady]);

  // Memoize the container
  const container = useMemo(
    () => (
      <div data-vjs-player className={containerClassName}>
        <div ref={videoRef} className="h-full w-full" />
        {/* Render custom content as React portal when player is ready */}
        {isPlayerReady && customContent && (
          <div
            className={`vjs-custom-content vjs-custom-content-${contentPosition}`}
            style={{
              position: "absolute",
              zIndex: 10,
              pointerEvents: "none",
              ...(contentPosition === "bottom" && {
                bottom: "80px",
                left: 0,
                right: 0,
                textAlign: "center",
              }),
              ...(contentPosition === "top" && {
                top: "80px",
                left: 0,
                right: 0,
                textAlign: "center",
              }),
              ...(contentPosition === "center" && {
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
              }),
            }}
          >
            <div style={{ pointerEvents: "auto" }}>{customContent}</div>
          </div>
        )}
      </div>
    ),
    [containerClassName, isPlayerReady, customContent, contentPosition],
  );

  return container;
};

export default VideoJS;
