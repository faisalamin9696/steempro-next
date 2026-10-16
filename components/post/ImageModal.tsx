"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Modal, ModalContent } from "@heroui/modal";
import { Tooltip } from "@heroui/tooltip";
import { Button } from "@heroui/button";
import {
  TransformWrapper,
  TransformComponent,
  useControls,
} from "react-zoom-pan-pinch";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ExternalLink,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { twMerge } from "tailwind-merge";
import { Spinner } from "@heroui/spinner";
import { getNaturalSize } from "@/utils/proxifyUrl";

/** One image of a post, exactly as the post body renders it. */
export interface GalleryImage {
  src: string;
  alt?: string;
}

interface ImageModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  src: string;
  alt?: string;
  /**
   * Every image of the post in render order, so the modal can page between
   * them. When omitted the modal shows a single image and hides the controls.
   */
  gallery?: GalleryImage[];
  /** Position of `src` inside `gallery`, so paging starts from what was tapped. */
  index?: number;
}

const Controls = ({ src }: { src: string }) => {
  const { zoomIn, zoomOut, resetTransform } = useControls();

  const handleOpenNewTab = useCallback(() => {
    window.open(src, "_blank");
  }, [src]);

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 p-2 bg-background/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
      <Tooltip content="Zoom In">
        <Button
          isIconOnly
          radius="full"
          variant="light"
          onPress={() => zoomIn()}
          className="text-foreground/80 hover:text-foreground"
        >
          <ZoomIn size={20} />
        </Button>
      </Tooltip>
      <Tooltip content="Zoom Out">
        <Button
          isIconOnly
          radius="full"
          variant="light"
          onPress={() => zoomOut()}
          className="text-foreground/80 hover:text-foreground"
        >
          <ZoomOut size={20} />
        </Button>
      </Tooltip>
      <Tooltip content="Reset">
        <Button
          isIconOnly
          radius="full"
          variant="light"
          onPress={() => resetTransform()}
          className="text-foreground/80 hover:text-foreground"
        >
          <RotateCcw size={20} />
        </Button>
      </Tooltip>
      <div className="w-px h-6 bg-divider mx-1" />
      <Tooltip content="Open in new tab">
        <Button
          isIconOnly
          radius="full"
          variant="light"
          onPress={handleOpenNewTab}
          className="text-foreground/80 hover:text-foreground"
        >
          <ExternalLink size={20} />
        </Button>
      </Tooltip>
    </div>
  );
};

export default function ImageModal({
  isOpen,
  onOpenChange,
  src,
  alt = "Image full view",
  gallery,
  index = 0,
}: ImageModalProps) {
  const images = useMemo(
    () => (gallery && gallery.length > 0 ? gallery : [{ src, alt }]),
    [gallery, src, alt],
  );
  const total = images.length;
  const hasMultiple = total > 1;

  // The modal is mounted fresh on open, so this initialiser also decides where
  // paging starts: always the image the reader actually tapped.
  const [current, setCurrent] = useState(() =>
    Math.min(Math.max(index, 0), total - 1),
  );
  // Derived rather than reset by an effect: paging swaps the source, and this
  // follows on its own. It also stays false when paging onto a duplicate URL,
  // so the same photo does not flash its spinner again.
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);

  const active = images[current] ?? images[0];
  const highResImage = getNaturalSize(active.src);
  const lowResImage = active.src;
  const isLoading = loadedSrc !== active.src;

  const step = useCallback(
    (delta: number) => {
      // Wraps at both ends, like a carousel, rather than stopping.
      setCurrent((prev) => (prev + delta + total) % total);
    },
    [total],
  );

  useEffect(() => {
    if (!isOpen || !hasMultiple) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") step(1);
      else if (event.key === "ArrowLeft") step(-1);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, hasMultiple, step]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="full"
      backdrop="opaque"
      classNames={{
        base: "bg-black/5 backdrop-blur-sm",
        wrapper: "z-[100]",
        backdrop: "bg-black/80",
        closeButton:
          "top-4 right-4 z-110 bg-white/10 hover:bg-white/20 text-white p-2 text-xl",
      }}
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: "easeOut",
            },
          },
          exit: {
            y: 20,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: "easeIn",
            },
          },
        },
      }}
      hideCloseButton
    >
      <ModalContent className="relative h-full w-full overflow-hidden flex items-center justify-center p-0">
        {(onClose) => (
          <>
            {/* Header / Close Button */}
            <div className="absolute top-0 left-0 right-0 p-6 flex items-center gap-3 z-110 bg-linear-to-b from-black/40 to-transparent">
              {hasMultiple && (
                <span className="text-white/90 text-sm font-medium tabular-nums tracking-wide drop-shadow-sm">
                  {current + 1} / {total}
                </span>
              )}
              <Button
                isIconOnly
                radius="full"
                variant="flat"
                onPress={onClose}
                className="ml-auto bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10"
              >
                <X size={24} />
              </Button>
            </div>

            {hasMultiple && (
              <>
                <Button
                  isIconOnly
                  radius="full"
                  variant="flat"
                  aria-label="Previous image"
                  onPress={() => step(-1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-110 w-12 h-12 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10"
                >
                  <ChevronLeft size={28} />
                </Button>
                <Button
                  isIconOnly
                  radius="full"
                  variant="flat"
                  aria-label="Next image"
                  onPress={() => step(1)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-110 w-12 h-12 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10"
                >
                  <ChevronRight size={28} />
                </Button>
              </>
            )}

            {isLoading && (
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-110 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 px-4 py-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl">
                  <Spinner size="sm" color="primary" />
                  <span className="text-white/90 text-sm font-medium tracking-wide drop-shadow-sm">
                    Loading HD
                  </span>
                </div>
              </div>
            )}

            <TransformWrapper
              // Remount per image so paging never carries over the previous
              // image's zoom / pan position.
              key={active.src}
              initialScale={1}
              minScale={0.5}
              maxScale={8}
              centerOnInit
              doubleClick={{ mode: "reset" }}
              wheel={{ step: 0.1 }}
            >
              <>
                {!isLoading && <Controls src={highResImage!} />}
                <TransformComponent
                  wrapperClass="!w-full !h-full cursor-grab active:cursor-grabbing"
                  contentClass="!w-full !h-full flex items-center justify-center"
                >
                  <div className="relative h-full w-full flex items-center justify-center max-w-[95vw] max-h-[95vh]">
                    {/* Low Res Placeholder */}
                    <img
                      src={lowResImage!}
                      alt={active.alt ?? alt}
                      className={twMerge(
                        "max-w-full max-h-full object-contain transition-all duration-1000 ease-in-out pointer-events-none select-none",
                        isLoading ? "opacity-100" : "opacity-0 invisible",
                      )}
                    />
                    {/* High Res Image */}
                    <img
                      src={highResImage!}
                      alt={active.alt ?? alt}
                      fetchPriority="high"
                      onLoad={() => setLoadedSrc(active.src)}
                      onError={(e) => {
                        // If high-res original fails, try the low-res proxied one as fallback
                        if (e.currentTarget.src !== lowResImage) {
                          e.currentTarget.src = lowResImage!;
                        } else {
                          setLoadedSrc(active.src);
                        }
                      }}
                      className={twMerge(
                        "absolute inset-0 w-full h-full object-contain shadow-2xl transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) pointer-events-none select-none",
                        isLoading
                          ? "opacity-0 scale-95 grayscale-[0.5]"
                          : "opacity-100 scale-100 grayscale-0",
                      )}
                    />
                  </div>
                </TransformComponent>
              </>
            </TransformWrapper>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
