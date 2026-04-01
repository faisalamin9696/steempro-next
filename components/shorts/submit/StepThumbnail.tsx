"use client";

import { Button } from "@heroui/button";
import { Image } from "@heroui/image";
import { Progress } from "@heroui/react";
import {
  Camera,
  CheckCircle2,
  Image as ImageIcon,
  LoaderCircle,
  Video as VideoIcon,
  Sparkles,
  Wand2,
} from "lucide-react";
import ImageUploadButton from "@/components/submit/ImageUploadButton";
import type { StageCard } from "./types";

interface Props {
  videoObjectUrl: string;
  thumbObjectUrl: string;
  thumbnailUrl: string | null;
  showThumbnail: boolean;
  setShowThumbnail: (v: boolean) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  thumbnailStageCard: StageCard;
  isProcessingThumbnail: boolean;
  imageUploadProgress: number | null;
  canManageThumbnail: boolean;
  onCaptureFrame: () => void;
  onThumbnailUpload: (file: File) => void;
  onNext: () => void;
}

export function StepThumbnail({
  videoObjectUrl,
  thumbObjectUrl,
  thumbnailUrl,
  showThumbnail,
  setShowThumbnail,
  videoRef,
  thumbnailStageCard,
  isProcessingThumbnail,
  imageUploadProgress,
  canManageThumbnail,
  onCaptureFrame,
  onThumbnailUpload,
  onNext,
}: Props) {
  // Improvement: Pause video when switching to "Cover" view to ensure
  // the capture frame logic has a static buffer to work with.
  const handleToggleView = (showThumb: boolean) => {
    setShowThumbnail(showThumb);
    if (showThumb && videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-warning/10 text-warning">
            <Sparkles size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-warning">
              Step 03
            </p>
            <h3 className="text-xl font-black tracking-tight text-foreground">
              Select Thumbnail
            </h3>
            <p className="text-sm font-medium text-default-500">
              The first thing viewers see. Choose a compelling cover.
            </p>
          </div>
        </div>

        {/* Immersive Toggle */}
        <div className="inline-flex rounded-2xl border border-default-200 bg-white/5 p-1.5 shadow-inner dark:border-white/5 dark:bg-zinc-900/50">
          <Button
            size="md"
            variant={showThumbnail ? "solid" : "light"}
            color={showThumbnail ? "primary" : "default"}
            className={`h-10 rounded-xl px-5 text-xs font-black uppercase tracking-widest transition-all ${showThumbnail ? "shadow-lg shadow-primary/20" : "text-default-500 hover:text-foreground"}`}
            onPress={() => handleToggleView(true)}
            startContent={<ImageIcon size={16} />}
          >
            Cover
          </Button>
          <Button
            size="md"
            variant={!showThumbnail ? "solid" : "light"}
            color={!showThumbnail ? "primary" : "default"}
            className={`h-10 rounded-xl px-5 text-xs font-black uppercase tracking-widest transition-all ${!showThumbnail ? "shadow-lg shadow-primary/20" : "text-default-500 hover:text-foreground"}`}
            onPress={() => handleToggleView(false)}
            startContent={<VideoIcon size={16} />}
          >
            Video
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Cinematic Preview */}
        <div
          className={`group relative aspect-9/16 max-h-[600px] overflow-hidden rounded-4xl bg-zinc-950 border border-white/5 shadow-2xl transition-transform duration-500 ${isProcessingThumbnail ? "scale-[0.98] opacity-80" : ""}`}
        >
          {thumbnailUrl && showThumbnail ? (
            <Image
              src={thumbObjectUrl}
              alt="Thumbnail"
              className="h-full w-full object-contain animate-in zoom-in-95 duration-300"
              removeWrapper
            />
          ) : (
            <video
              ref={videoRef}
              src={videoObjectUrl}
              className="h-full w-full object-contain"
              crossOrigin="anonymous"
              playsInline
              controls
              muted // Ensures better browser compatibility for programmatic access
              preload="auto"
            />
          )}

          {/* Overlay Loader for Capture */}
          {isProcessingThumbnail && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <LoaderCircle className="animate-spin text-primary" size={42} />
            </div>
          )}
        </div>

        {/* Intelligent Controls */}
        <div className="flex flex-col gap-6">
          <div className="space-y-4">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-default-400 px-1">
              Thumbnail Options
            </h4>

            <div className="grid grid-cols-1 gap-3">
              <Button
                size="lg"
                variant="flat"
                color="primary"
                className="h-14 rounded-2xl justify-start px-5 group transition-all"
                onPress={() => {
                  // Force view to Video before capturing so videoRef is available
                  if (showThumbnail) setShowThumbnail(false);
                  // Small delay to ensure DOM is rendered if we switched
                  setTimeout(onCaptureFrame, 50);
                }}
                isLoading={isProcessingThumbnail}
                isDisabled={!canManageThumbnail}
                startContent={
                  !isProcessingThumbnail && (
                    <Camera
                      size={18}
                      className="text-primary group-hover:scale-110 transition-transform"
                    />
                  )
                }
              >
                <div className="text-left flex-1">
                  <p className="text-sm font-bold">Capture Frame</p>
                  <p className="text-[10px] opacity-60">
                    Use current video frame
                  </p>
                </div>
              </Button>

              <ImageUploadButton
                size="lg"
                variant="flat"
                className="h-14 rounded-2xl justify-start px-5 group transition-all"
                isDisabled={!canManageThumbnail || isProcessingThumbnail}
                onImagesSelected={(files) => onThumbnailUpload(files[0])}
                progress={imageUploadProgress ?? undefined}
                hideIcon
                hideProgress
              >
                <div className="flex items-center gap-4 text-left">
                  <Wand2
                    size={18}
                    className="text-info group-hover:scale-110 transition-transform"
                  />
                  <div className="text-left flex-1">
                    <p className="text-sm font-bold">Custom Cover</p>
                    <p className="text-[10px] opacity-60">
                      Upload high-res JPG/PNG
                    </p>
                  </div>
                </div>
              </ImageUploadButton>
            </div>
          </div>

          {/* Real-time Status */}
          <div
            className={`rounded-3xl border p-5 transition-all duration-300 ${
              thumbnailStageCard.complete
                ? "border-success/30 bg-success/5 shadow-sm shadow-success/10"
                : thumbnailStageCard.active
                  ? "border-primary/30 bg-primary/5 shadow-lg shadow-primary/5"
                  : "border-default-200/50 bg-default-100/50 dark:border-white/5 dark:bg-white/5"
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-4">
              <p
                className={`text-[11px] font-black uppercase tracking-widest ${thumbnailStageCard.active ? "text-primary" : "text-default-400"}`}
              >
                Thumbnail Status
              </p>
              {thumbnailStageCard.complete ? (
                <CheckCircle2 size={14} className="text-success" />
              ) : thumbnailStageCard.active ? (
                <LoaderCircle size={14} className="animate-spin text-primary" />
              ) : null}
            </div>
            <Progress
              aria-label="Thumbnail progress"
              value={thumbnailStageCard.progress}
              color={thumbnailStageCard.complete ? "success" : "primary"}
              size="sm"
              radius="full"
              className="transition-all duration-500"
            />
          </div>

          <div className="mt-auto space-y-4">
            <div className="rounded-2xl bg-default-100 p-4 border border-default-200 shadow-inner dark:bg-white/5 dark:border-white/5">
              <p className="text-[11px] leading-relaxed text-default-500 font-medium italic text-center">
                "Thumbnails are the soul of short-form content. Choose a frame
                with high movement or clear focus."
              </p>
            </div>

            {thumbnailUrl && (
              <Button
                size="lg"
                color="primary"
                variant="shadow"
                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all"
                onPress={onNext}
              >
                Review Details →
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
