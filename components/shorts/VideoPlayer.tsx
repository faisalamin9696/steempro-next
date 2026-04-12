import React, { ComponentProps, forwardRef, ReactNode, useMemo } from "react";
import { twMerge } from "tailwind-merge";
import {
  BufferingIndicator,
  Controls,
  ErrorDialog,
  FullscreenButton,
  MuteButton,
  PlaybackRateButton,
  PlayButton,
  Popover,
  SeekButton,
  Slider,
  Time,
  TimeSlider,
  Tooltip,
  usePlayer,
  VolumeSlider,
} from "@videojs/react";
import { HlsVideo, HlsVideoProps } from "@videojs/react/media/hls-video";
import "./style.scss";
import { ShortsPlayerInstance } from "@/app/shorts/page";
import { useAppDispatch, useAppSelector } from "@/hooks/redux/store";
import { addCommonDataHandler } from "@/hooks/redux/reducers/CommonReducer";

interface VideoPlayerEnhancedProps extends HlsVideoProps {
  className?: string;
  customContent?: React.ReactNode;
  contentPosition?: "top" | "bottom" | "center";
  onPlayerReady?: (player: any) => void;
  isActive?: boolean;
}

const SEEK_TIME = 10;

export const VideoPlayer: React.FC<VideoPlayerEnhancedProps> = ({
  className,
  customContent,
  contentPosition = "bottom",
  onPlayerReady,
  isActive,
  ...props
}) => {
  const shortsPlayerInstance = ShortsPlayerInstance.usePlayer().target;
  const dispatch = useAppDispatch();
  const commonData = useAppSelector((s) => s.commonReducer.values);
  const isVideoMuted = commonData.isShortsMuted;

  function cleanVideo(videoElement: HTMLVideoElement) {
    if (!videoElement.paused) videoElement.pause();
  }

  function togglePlay(e: HTMLVideoElement) {
    if (e.paused) e.play();
    else e.pause();
  }

  return (
    <div
      className={twMerge(
        "h-full w-full relative group/vjs rounded-none! overflow-hidden ",
        className,
      )}
    >
      <ShortsPlayerInstance.Container
        className={`media-default-skin media-default-skin--video controls rounded-none! md:rounded-2xl relative z-10 w-full h-full max-h-dvh`}
      >
        <HlsVideo
          onCanPlay={(e) => {
            e.currentTarget.volume = commonData.shortsVolume;
            if (!isActive) {
              cleanVideo(e.currentTarget);
            }
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            togglePlay(e.currentTarget);
          }}
          onVolumeChange={(e) => {
            dispatch(
              addCommonDataHandler({
                shortsVolume: e.currentTarget.volume,
              }),
            );
          }}
          {...props}
          muted={isVideoMuted}
        />

        <BufferingIndicator
          render={(props) => (
            <div {...props} className="media-buffering-indicator">
              <div className="media-surface">
                <SpinnerIcon className="media-icon" />
              </div>
            </div>
          )}
        />
        <ErrorDialog.Root>
          <ErrorDialog.Popup className="media-error">
            <div className="media-error__dialog media-surface">
              <div className="media-error__content">
                <ErrorDialog.Title className="media-error__title">
                  Something went wrong.
                </ErrorDialog.Title>
                <ErrorDialog.Description className="media-error__description" />
              </div>
              <div className="media-error__actions">
                <ErrorDialog.Close className="media-button media-button--primary">
                  OK
                </ErrorDialog.Close>
              </div>
            </div>
          </ErrorDialog.Popup>
        </ErrorDialog.Root>

        <div className="controls-div">
          {/* Gradient overlay for better contrast */}
          <div className="absolute bottom-0 w-full h-58 xl:h-20 pointer-events-none bg-linear-to-t from-black/70 via-black/30 to-transparent" />

          {/* Secondary overlay for additional contrast on white backgrounds */}
          <div className="absolute bottom-0 w-full h-58 xl:h-20 pointer-events-none bg-linear-to-t from-white/10 via-transparent to-transparent mix-blend-overlay" />

          {customContent && (
            <div className="w-full pointer-events-auto absolute bottom-20!">
              {customContent}
            </div>
          )}

          <Controls.Root className="media-surface media-controls  backdrop-blur-none! p-2! absolute! bottom-0! inset-x-0! rounded-none! h-max">
            <Tooltip.Provider>
              <div className="media-button-group">
                <Tooltip.Root side="top">
                  <Tooltip.Trigger
                    render={
                      <PlayButton
                        className="media-button--play"
                        render={<Button />}
                      >
                        <RestartIcon className="media-icon media-icon--restart" />
                        <PlayIcon className="media-icon media-icon--play" />
                        <PauseIcon className="media-icon media-icon--pause" />
                      </PlayButton>
                    }
                  />
                  <Tooltip.Popup className="media-surface media-tooltip">
                    <PlayLabel />
                  </Tooltip.Popup>
                </Tooltip.Root>

                <Tooltip.Root side="top">
                  <Tooltip.Trigger
                    render={
                      <SeekButton
                        seconds={-SEEK_TIME}
                        className="media-button--seek"
                        render={<Button />}
                      >
                        <span className="media-icon__container">
                          <SeekIcon className="media-icon media-icon--seek media-icon--flipped" />
                          <span className="media-icon__label">{SEEK_TIME}</span>
                        </span>
                      </SeekButton>
                    }
                  />
                  <Tooltip.Popup className="media-surface media-tooltip">
                    Seek backward {SEEK_TIME} seconds
                  </Tooltip.Popup>
                </Tooltip.Root>

                <Tooltip.Root side="top">
                  <Tooltip.Trigger
                    render={
                      <SeekButton
                        seconds={SEEK_TIME}
                        className="media-button--seek"
                        render={<Button />}
                      >
                        <span className="media-icon__container">
                          <SeekIcon className="media-icon media-icon--seek" />
                          <span className="media-icon__label">{SEEK_TIME}</span>
                        </span>
                      </SeekButton>
                    }
                  />
                  <Tooltip.Popup className="media-surface media-tooltip">
                    Seek forward {SEEK_TIME} seconds
                  </Tooltip.Popup>
                </Tooltip.Root>
              </div>

              <div className="media-time-controls">
                <Time.Value type="current" className="media-time" />
                <TimeSlider.Root className="media-slider">
                  <TimeSlider.Track className="media-slider__track">
                    <TimeSlider.Fill className="media-slider__fill" />
                    <TimeSlider.Buffer className="media-slider__buffer" />
                  </TimeSlider.Track>
                  <TimeSlider.Thumb className="media-slider__thumb" />

                  <div className="media-surface media-preview media-slider__preview">
                    <Slider.Thumbnail className="media-preview__thumbnail" />
                    <TimeSlider.Value
                      type="pointer"
                      className="media-time media-preview__time"
                    />
                    <SpinnerIcon className="media-preview__spinner media-icon" />
                  </div>
                </TimeSlider.Root>
                <Time.Value type="duration" className="media-time" />
              </div>

              <div className="media-button-group">
                <Tooltip.Root side="top">
                  <Tooltip.Trigger
                    render={
                      <PlaybackRateButton
                        className="media-button--playback-rate"
                        render={<Button />}
                      />
                    }
                  />
                  <Tooltip.Popup className="media-surface media-tooltip">
                    Toggle playback rate
                  </Tooltip.Popup>
                </Tooltip.Root>
                {/* <Tooltip.Root side="bottom">
                <Tooltip.Trigger
                  render={
                    <CaptionsButton
                      className="media-button--captions"
                      render={<Button />}
                    >
                      <CaptionsOffIcon className="media-icon media-icon--captions-off" />
                      <CaptionsOnIcon className="media-icon media-icon--captions-on" />
                    </CaptionsButton>
                  }
                />
                <Tooltip.Popup className="media-surface media-tooltip">
                  <CaptionsLabel />
                </Tooltip.Popup>
              </Tooltip.Root> */}
                {/* <Tooltip.Root side="bottom">
                <Tooltip.Trigger
                  render={
                    <PiPButton
                      className="media-button--pip"
                      render={<Button />}
                    >
                      <PipEnterIcon className="media-icon media-icon--pip-enter" />
                      <PipExitIcon className="media-icon media-icon--pip-exit" />
                    </PiPButton>
                  }
                />
                <Tooltip.Popup className="media-surface media-tooltip">
                  <PiPLabel />
                </Tooltip.Popup>
              </Tooltip.Root> */}
                {isVideoMuted ? (
                  <Button
                    onClick={() => {
                      dispatch(
                        addCommonDataHandler({
                          isShortsMuted: false,
                          shortsVolume: shortsPlayerInstance?.media.volume,
                        }),
                      );
                    }}
                  >
                    <VolumeOffIcon className="media-icon media-icon--volume-off" />
                  </Button>
                ) : (
                  <Popover.Root
                    openOnHover
                    delay={200}
                    closeDelay={500}
                    side="top"
                  >
                    <Popover.Trigger
                      render={
                        <Button
                          onClick={() => {
                            dispatch(
                              addCommonDataHandler({
                                isShortsMuted: true,
                                shortsVolume:
                                  shortsPlayerInstance?.media.volume,
                              }),
                            );
                          }}
                        >
                          <VolumeLowIcon className="media-icon media-icon--volume-low" />
                          <VolumeHighIcon className="media-icon media-icon--volume-high" />
                        </Button>
                      }
                    />
                    <Popover.Popup className="media-surface media-popover media-popover--volume p-0! px-2!">
                      <VolumeSlider.Root
                        className="media-slider"
                        orientation="horizontal"
                        thumbAlignment="edge"
                      >
                        <VolumeSlider.Track className="media-slider__track">
                          <VolumeSlider.Fill className="media-slider__fill" />
                        </VolumeSlider.Track>
                        <VolumeSlider.Thumb className="media-slider__thumb media-slider__thumb--persistent" />
                      </VolumeSlider.Root>
                    </Popover.Popup>
                  </Popover.Root>
                )}
                {/* {/* <VolumePop    */}{" "}
                <Tooltip.Root side="top">
                  <Tooltip.Trigger
                    render={
                      <FullscreenButton
                        className="media-button--fullscreen"
                        render={<Button />}
                      >
                        <FullscreenEnterIcon className="media-icon media-icon--fullscreen-enter" />
                        <FullscreenExitIcon className="media-icon media-icon--fullscreen-exit" />
                      </FullscreenButton>
                    }
                  />
                  <Tooltip.Popup className="media-surface media-tooltip">
                    <FullscreenLabel />
                  </Tooltip.Popup>
                </Tooltip.Root>
              </div>
            </Tooltip.Provider>
          </Controls.Root>
        </div>
        <div className="media-overlay" />
      </ShortsPlayerInstance.Container>
    </div>
  );
};

export default VideoPlayer;

function VolumePopover(): ReactNode {
  const volumeUnsupported = usePlayer(
    (s) => s.volumeAvailability === "unsupported",
  );

  const muteButton = (
    <MuteButton className="media-button--mute" render={<Button />}>
      <VolumeOffIcon className="media-icon media-icon--volume-off" />
      <VolumeLowIcon className="media-icon media-icon--volume-low" />
      <VolumeHighIcon className="media-icon media-icon--volume-high" />
    </MuteButton>
  );

  if (volumeUnsupported) return muteButton;

  return (
    <Popover.Root openOnHover delay={200} closeDelay={100} side="top">
      <Popover.Trigger render={muteButton} />
      <Popover.Popup className="media-surface media-popover media-popover--volume">
        <VolumeSlider.Root
          className="media-slider"
          orientation="vertical"
          thumbAlignment="edge"
        >
          <VolumeSlider.Track className="media-slider__track">
            <VolumeSlider.Fill className="media-slider__fill" />
          </VolumeSlider.Track>
          <VolumeSlider.Thumb className="media-slider__thumb media-slider__thumb--persistent" />
        </VolumeSlider.Root>
      </Popover.Popup>
    </Popover.Root>
  );
}

function PlayLabel(): string {
  const paused = usePlayer((s) => Boolean(s.paused));
  const ended = usePlayer((s) => Boolean(s.ended));
  if (ended) return "Replay";
  return paused ? "Play" : "Pause";
}

function FullscreenLabel(): string {
  const fullscreen = usePlayer((s) => Boolean(s.fullscreen));
  return fullscreen ? "Exit fullscreen" : "Enter fullscreen";
}

const Button = forwardRef<HTMLButtonElement, ComponentProps<"button">>(
  function Button({ className, ...props }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        className={`media-button media-button--subtle media-button--icon ${className ?? ""}`}
        {...props}
      />
    );
  },
);

function FullscreenEnterIcon(props: ComponentProps<"svg">): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      fill="none"
      aria-hidden="true"
      viewBox="0 0 18 18"
      {...props}
    >
      <path
        fill="currentColor"
        d="M9.57 3.617A1 1 0 0 0 8.646 3H4c-.552 0-1 .449-1 1v4.646a.996.996 0 0 0 1.001 1 1 1 0 0 0 .706-.293l4.647-4.647a1 1 0 0 0 .216-1.089m4.812 4.812a1 1 0 0 0-1.089.217l-4.647 4.647a.998.998 0 0 0 .708 1.706H14c.552 0 1-.449 1-1V9.353a1 1 0 0 0-.618-.924"
      />
    </svg>
  );
}

function FullscreenExitIcon(props: ComponentProps<"svg">): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      fill="none"
      aria-hidden="true"
      viewBox="0 0 18 18"
      {...props}
    >
      <path
        fill="currentColor"
        d="M7.883 1.93a.99.99 0 0 0-1.09.217L2.146 6.793A.998.998 0 0 0 2.853 8.5H7.5c.551 0 1-.449 1-1V2.854a1 1 0 0 0-.617-.924m7.263 7.57H10.5c-.551 0-1 .449-1 1v4.646a.996.996 0 0 0 1.001 1.001 1 1 0 0 0 .706-.293l4.646-4.646a.998.998 0 0 0-.707-1.707z"
      />
    </svg>
  );
}

function PauseIcon(props: ComponentProps<"svg">): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      fill="none"
      aria-hidden="true"
      viewBox="0 0 18 18"
      {...props}
    >
      <rect width="5" height="14" x="2" y="2" fill="currentColor" rx="1.75" />
      <rect width="5" height="14" x="11" y="2" fill="currentColor" rx="1.75" />
    </svg>
  );
}

function PlayIcon(props: ComponentProps<"svg">): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      fill="none"
      aria-hidden="true"
      viewBox="0 0 18 18"
      {...props}
    >
      <path
        fill="currentColor"
        d="m14.051 10.723-7.985 4.964a1.98 1.98 0 0 1-2.758-.638A2.06 2.06 0 0 1 3 13.964V4.036C3 2.91 3.895 2 5 2c.377 0 .747.109 1.066.313l7.985 4.964a2.057 2.057 0 0 1 .627 2.808c-.16.257-.373.475-.627.637"
      />
    </svg>
  );
}

function RestartIcon(props: ComponentProps<"svg">): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      fill="none"
      aria-hidden="true"
      viewBox="0 0 18 18"
      {...props}
    >
      <path
        fill="currentColor"
        d="M9 17a8 8 0 0 1-8-8h2a6 6 0 1 0 1.287-3.713l1.286 1.286A.25.25 0 0 1 5.396 7H1.25A.25.25 0 0 1 1 6.75V2.604a.25.25 0 0 1 .427-.177l1.438 1.438A8 8 0 1 1 9 17"
      />
      <path
        fill="currentColor"
        d="m11.61 9.639-3.331 2.07a.826.826 0 0 1-1.15-.266.86.86 0 0 1-.129-.452V6.849C7 6.38 7.374 6 7.834 6c.158 0 .312.045.445.13l3.331 2.071a.858.858 0 0 1 0 1.438"
      />
    </svg>
  );
}

function SeekIcon(props: ComponentProps<"svg">): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      fill="none"
      aria-hidden="true"
      viewBox="0 0 18 18"
      {...props}
    >
      <path
        fill="currentColor"
        d="M1 9c0 2.21.895 4.21 2.343 5.657l1.414-1.414a6 6 0 1 1 8.956-7.956l-1.286 1.286a.25.25 0 0 0 .177.427h4.146a.25.25 0 0 0 .25-.25V2.604a.25.25 0 0 0-.427-.177l-1.438 1.438A8 8 0 0 0 1 9"
      />
    </svg>
  );
}

function SpinnerIcon(props: ComponentProps<"svg">): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      fill="currentColor"
      aria-hidden="true"
      viewBox="0 0 18 18"
      {...props}
    >
      <rect width="2" height="5" x="8" y=".5" opacity=".5" rx="1">
        <animate
          attributeName="opacity"
          begin="0s"
          calcMode="linear"
          dur="1s"
          repeatCount="indefinite"
          values="1;0"
        />
      </rect>
      <rect
        width="2"
        height="5"
        x="12.243"
        y="2.257"
        opacity=".45"
        rx="1"
        transform="rotate(45 13.243 4.757)"
      >
        <animate
          attributeName="opacity"
          begin="0.125s"
          calcMode="linear"
          dur="1s"
          repeatCount="indefinite"
          values="1;0"
        />
      </rect>
      <rect width="5" height="2" x="12.5" y="8" opacity=".4" rx="1">
        <animate
          attributeName="opacity"
          begin="0.25s"
          calcMode="linear"
          dur="1s"
          repeatCount="indefinite"
          values="1;0"
        />
      </rect>
      <rect
        width="5"
        height="2"
        x="10.743"
        y="12.243"
        opacity=".35"
        rx="1"
        transform="rotate(45 13.243 13.243)"
      >
        <animate
          attributeName="opacity"
          begin="0.375s"
          calcMode="linear"
          dur="1s"
          repeatCount="indefinite"
          values="1;0"
        />
      </rect>
      <rect width="2" height="5" x="8" y="12.5" opacity=".3" rx="1">
        <animate
          attributeName="opacity"
          begin="0.5s"
          calcMode="linear"
          dur="1s"
          repeatCount="indefinite"
          values="1;0"
        />
      </rect>
      <rect
        width="2"
        height="5"
        x="3.757"
        y="10.743"
        opacity=".25"
        rx="1"
        transform="rotate(45 4.757 13.243)"
      >
        <animate
          attributeName="opacity"
          begin="0.625s"
          calcMode="linear"
          dur="1s"
          repeatCount="indefinite"
          values="1;0"
        />
      </rect>
      <rect width="5" height="2" x=".5" y="8" opacity=".15" rx="1">
        <animate
          attributeName="opacity"
          begin="0.75s"
          calcMode="linear"
          dur="1s"
          repeatCount="indefinite"
          values="1;0"
        />
      </rect>
      <rect
        width="5"
        height="2"
        x="2.257"
        y="3.757"
        opacity=".1"
        rx="1"
        transform="rotate(45 4.757 4.757)"
      >
        <animate
          attributeName="opacity"
          begin="0.875s"
          calcMode="linear"
          dur="1s"
          repeatCount="indefinite"
          values="1;0"
        />
      </rect>
    </svg>
  );
}

function VolumeHighIcon(props: ComponentProps<"svg">): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      fill="none"
      aria-hidden="true"
      viewBox="0 0 18 18"
      {...props}
    >
      <path
        fill="currentColor"
        d="M15.6 3.3c-.4-.4-1-.4-1.4 0s-.4 1 0 1.4C15.4 5.9 16 7.4 16 9s-.6 3.1-1.8 4.3c-.4.4-.4 1 0 1.4.2.2.5.3.7.3.3 0 .5-.1.7-.3C17.1 13.2 18 11.2 18 9s-.9-4.2-2.4-5.7"
      />
      <path
        fill="currentColor"
        d="M.714 6.008h3.072l4.071-3.857c.5-.376 1.143 0 1.143.601V15.28c0 .602-.643.903-1.143.602l-4.071-3.858H.714c-.428 0-.714-.3-.714-.752V6.76c0-.451.286-.752.714-.752m10.568.59a.91.91 0 0 1 0-1.316.91.91 0 0 1 1.316 0c1.203 1.203 1.47 2.216 1.522 3.208q.012.255.011.51c0 1.16-.358 2.733-1.533 3.803a.7.7 0 0 1-.298.156c-.382.106-.873-.011-1.018-.156a.91.91 0 0 1 0-1.316c.57-.57.995-1.551.995-2.487 0-.944-.26-1.667-.995-2.402"
      />
    </svg>
  );
}

function VolumeLowIcon(props: ComponentProps<"svg">): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      fill="none"
      aria-hidden="true"
      viewBox="0 0 18 18"
      {...props}
    >
      <path
        fill="currentColor"
        d="M.714 6.008h3.072l4.071-3.857c.5-.376 1.143 0 1.143.601V15.28c0 .602-.643.903-1.143.602l-4.071-3.858H.714c-.428 0-.714-.3-.714-.752V6.76c0-.451.286-.752.714-.752m10.568.59a.91.91 0 0 1 0-1.316.91.91 0 0 1 1.316 0c1.203 1.203 1.47 2.216 1.522 3.208q.012.255.011.51c0 1.16-.358 2.733-1.533 3.803a.7.7 0 0 1-.298.156c-.382.106-.873-.011-1.018-.156a.91.91 0 0 1 0-1.316c.57-.57.995-1.551.995-2.487 0-.944-.26-1.667-.995-2.402"
      />
    </svg>
  );
}

function VolumeOffIcon(props: ComponentProps<"svg">): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      fill="none"
      aria-hidden="true"
      viewBox="0 0 18 18"
      {...props}
    >
      <path
        fill="currentColor"
        d="M.714 6.008h3.072l4.071-3.857c.5-.376 1.143 0 1.143.601V15.28c0 .602-.643.903-1.143.602l-4.071-3.858H.714c-.428 0-.714-.3-.714-.752V6.76c0-.451.286-.752.714-.752M14.5 7.586l-1.768-1.768a1 1 0 1 0-1.414 1.414L13.085 9l-1.767 1.768a1 1 0 0 0 1.414 1.414l1.768-1.768 1.768 1.768a1 1 0 0 0 1.414-1.414L15.914 9l1.768-1.768a1 1 0 0 0-1.414-1.414z"
      />
    </svg>
  );
}
