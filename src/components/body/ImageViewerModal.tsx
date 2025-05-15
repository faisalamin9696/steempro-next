import {
  defaultSrcSet,
  proxifyImageUrl,
  rProxyDomain,
} from "@/libs/utils/proxifyUrl";
import { Button } from "@heroui/button";
import { Modal, ModalBody, ModalContent, ModalFooter } from "@heroui/modal";
import Image from "next/image";
import React, { useRef, useState } from "react";
import { BiZoomIn, BiZoomOut } from "react-icons/bi";
import { MdOpenInNew, MdZoomOutMap } from "react-icons/md";
import {
  ReactZoomPanPinchRef,
  TransformComponent,
  TransformWrapper,
} from "react-zoom-pan-pinch";
import { twMerge } from "tailwind-merge";
import { Spinner } from "@heroui/spinner";

interface Props {
  isOpen: boolean;
  onOpenChange: (isOPen: boolean) => void;
  src: string;
  alt?: string;
}

const Controls = ({
  zoomIn,
  zoomOut,
  resetTransform,
  isLoaded,
  handleOpenImage,
}) => (
  <div className="flex flex-row gap-4 justify-between">
    <div className="flex flex-row gap-4 items-center">
      <Button size="sm" isIconOnly radius="full" onPress={() => zoomIn()}>
        <BiZoomIn size={20} />
      </Button>

      <Button size="sm" isIconOnly radius="full" onPress={() => zoomOut()}>
        <BiZoomOut size={20} />
      </Button>

      <Button
        size="sm"
        isIconOnly
        radius="full"
        onPress={() => resetTransform()}
      >
        <MdZoomOutMap size={20} />
      </Button>
    </div>

    <Button
      size="sm"
      isIconOnly
      title="Open image"
      variant="solid"
      color="primary"
      onPress={handleOpenImage}
      isDisabled={!isLoaded}
      radius="full"
      className="open-button"
    >
      {isLoaded ? (
        <MdOpenInNew size={18} />
      ) : (
        <Spinner color="white" size="sm" />
      )}
    </Button>
  </div>
);

function ImageViewerModal(props: Props) {
  const { isOpen, onOpenChange, src, alt } = props;
  const [isFetching, setIsFetching] = useState(true);

  function handleOpenImage() {
    if (window) window.open(src, "_blank")?.focus();
  }

  const [isLoaded, setIsLoaded] = useState(false);

  const transformComponentRef = useRef<ReactZoomPanPinchRef | null>(null);

  function onLoadCompleted() {
    if (isFetching) {
      setIsFetching(false);
      setIsLoaded(true);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      scrollBehavior={"inside"}
      onOpenChange={onOpenChange}
      size="4xl"
      hideCloseButton
      placement="center"
    >
      <ModalContent>
        {(onClose) => (
          <>
            {/* <ModalHeader className="flex flex-col gap-1">
              Modal Title
            </ModalHeader> */}
            <ModalBody>
              <TransformWrapper ref={transformComponentRef}>
                {(utils) => (
                  <React.Fragment>
                    <Controls
                      {...utils}
                      isLoaded={isLoaded}
                      handleOpenImage={handleOpenImage}
                    />
                    <div className="justify-center flex flex-col items-center">
                      <TransformComponent>
                        <div className="flex flex-col justify-center w-full">
                          <Image
                            className={twMerge(
                              "zoomable",
                              isFetching && "bg-background/50"
                            )}
                            alt={"image"}
                            src={src}
                            height={0}
                            width={0}
                            onLoad={onLoadCompleted}
                            onError={onLoadCompleted}
                            style={{
                              width: "auto",
                              height: "auto",
                              objectFit: "contain",
                            }}
                          />
                        </div>
                      </TransformComponent>

                      <div className="text-sm opacity-disabled mt-2">
                        {props.alt}
                      </div>
                    </div>
                  </React.Fragment>
                )}
              </TransformWrapper>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export default ImageViewerModal;
