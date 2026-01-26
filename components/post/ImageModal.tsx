"use client";

import { useState, useEffect, useCallback } from "react";
import { Modal, ModalContent } from "@heroui/modal";
import { Tooltip } from "@heroui/tooltip";
import { Button } from "@heroui/button";
import {
  TransformWrapper,
  TransformComponent,
  useControls,
} from "react-zoom-pan-pinch";
import { ZoomIn, ZoomOut, RotateCcw, ExternalLink, X } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { Spinner } from "@heroui/spinner";
import { getNaturalSize } from "@/utils/proxifyUrl";

interface ImageModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  src: string;
  alt?: string;
}

const Controls = ({ src }: { src: string }) => {
  const { zoomIn, zoomOut, resetTransform } = useControls();

  const handleOpenNewTab = useCallback(() => {
    window.open(src, "_blank");
  }, [src]);

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-2 bg-background/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
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
}: ImageModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const highResImage = getNaturalSize(src);
  const lowResImage = src;

  // Reset loading state when src changes or modal opens
  useEffect(() => {
    if (isOpen) setIsLoading(true);
  }, [src, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="full"
      classNames={{
        base: "bg-black/95 sm:bg-black/90 backdrop-blur-sm",
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
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-end z-[110] bg-gradient-to-b from-black/40 to-transparent">
              <Button
                isIconOnly
                radius="full"
                variant="flat"
                onPress={onClose}
                className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10"
              >
                <X size={24} />
              </Button>
            </div>

            {isLoading && (
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[110] animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 px-4 py-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl">
                  <Spinner size="sm" color="primary" />
                  <span className="text-white/90 text-sm font-medium tracking-wide drop-shadow-sm">
                    Loading HD
                  </span>
                </div>
              </div>
            )}

            <TransformWrapper
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
                  <div className="relative flex items-center justify-center max-w-[95vw] max-h-[95vh]">
                    {/* Low Res Placeholder */}
                    <img
                      src={lowResImage!}
                      alt={alt}
                      className={twMerge(
                        "max-w-full max-h-full object-contain transition-all duration-1000 ease-in-out pointer-events-none select-none",
                        isLoading ? "opacity-100" : "opacity-0 invisible",
                      )}
                    />
                    {/* High Res Image */}
                    <img
                      src={highResImage!}
                      alt={alt}
                      onLoad={() => setIsLoading(false)}
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
