"use client";

import { useState, useEffect, useCallback } from "react";
import { Modal, ModalContent, Button, Tooltip } from "@heroui/react";
import {
  TransformWrapper,
  TransformComponent,
  useControls,
} from "react-zoom-pan-pinch";
import { ZoomIn, ZoomOut, RotateCcw, ExternalLink, X } from "lucide-react";
import { twMerge } from "tailwind-merge";
import LoadingStatus from "@/components/LoadingStatus";
import { getProxyImageURL } from "@/utils/image";

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
  const highResImage = getProxyImageURL(src, "large");

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
            <Button
              isIconOnly
              radius="full"
              variant="flat"
              onPress={onClose}
              className="absolute top-6 right-6 z-110 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10"
            >
              <X size={24} />
            </Button>

            {isLoading && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-300">
                <LoadingStatus message="Fetching high resolution..." />
              </div>
            )}

            <TransformWrapper
              initialScale={1}
              minScale={0.5}
              maxScale={5}
              centerOnInit
              wheel={{ step: 0.1 }}
              pinch={{ step: 5 }}
            >
              <>
                {!isLoading && <Controls src={highResImage} />}
                <TransformComponent
                  wrapperClass="!w-full !h-full cursor-move"
                  contentClass="!w-full !h-full flex items-center justify-center"
                >
                  <img
                    src={highResImage!}
                    alt={alt}
                    onLoad={() => setIsLoading(false)}
                    className={twMerge(
                      "max-w-full max-h-full object-contain shadow-2xl transition-all duration-500 ease-out pointer-events-none select-none",
                      isLoading ? "opacity-0 scale-95" : "opacity-100 scale-100"
                    )}
                  />
                </TransformComponent>
              </>
            </TransformWrapper>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
