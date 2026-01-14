"use client";

import { useState } from "react";
import { Image as HeroImage } from "@heroui/image";
import { twMerge } from "tailwind-merge";
import NextImage from "next/image";
import { Image, ImageOff } from "lucide-react";
import { Progress } from "@heroui/react";

interface CustomImageProps {
  src: string | null;
  alt?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  imageClass?: string;
  fetchPriority?: "low" | "high" | "auto";
  quality?: number;
}

function BodyImage({
  src,
  alt = "Image",
  width = "auto",
  height = "auto",
  className = "",
  onLoad,
  onError,
  imageClass,
  fetchPriority = "auto",
  quality = 75,
}: CustomImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLoad = () => {
    if (isLoading) setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    if (isLoading) setIsLoading(false);
    if (!hasError) setHasError(true);
    onError?.();
  };

  if (hasError || !src) {
    return (
      <div
        className={twMerge(
          "flex flex-col items-center justify-center bg-default-100/50 border border-dashed border-default-300 rounded-xl transition-all duration-300",
          className
        )}
        style={{
          width,
          height,
          minHeight: height === "auto" ? "180px" : undefined,
        }}
      >
        <div className="flex flex-col items-center gap-3 text-default-400 p-6">
          <div className="p-3 bg-default-200/50 rounded-full shadow-sm">
            <ImageOff size={28} strokeWidth={1.5} className="opacity-80" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-60">
              Image Error
            </span>
            <span className="text-[10px] opacity-50 text-center max-w-[150px] leading-tight">
              {!src ? "Missing source" : "Could not load image"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        key={src}
        className={twMerge(
          "relative block overflow-hidden rounded-lg group",
          className
        )}
        style={{ width, height }}
      >
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-default-100/40 backdrop-blur-[4px] transition-opacity duration-300 gap-3">
            <div className="animate-pulse flex flex-col items-center gap-2 text-default-400">
              <Image size={32} strokeWidth={1.2} />
            </div>
            <Progress
              size="sm"
              isIndeterminate
              aria-label="Loading..."
              className="max-w-[60px]"
            />
          </div>
        )}

        <HeroImage
          as={NextImage}
          src={src}
          alt={alt}
          width={0}
          height={0}
          isZoomed
          className={twMerge(
            `z-0 rounded-lg transition-all duration-500 cursor-zoom-in group-hover:opacity-90 ${
              isLoading ? "opacity-0" : "opacity-100"
            }`,
            imageClass
          )}
          onLoad={handleLoad}
          onError={handleError}
          onLoadingComplete={handleLoad}
          removeWrapper
          onClick={() => setIsModalOpen(true)}
          style={{
            objectFit: "cover",
            width,
            height,
          }}
          fetchPriority={fetchPriority}
          quality={quality}
        />
        {!isLoading && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
            <div className="p-1.5 bg-black/50 backdrop-blur-md rounded-full text-white/80">
              <Image size={14} />
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <ImageModal
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          src={src}
          alt={alt}
        />
      )}
    </>
  );
}

import ImageModal from "@/components/ui/ImageModal";

export default BodyImage;
