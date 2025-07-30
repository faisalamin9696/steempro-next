import NsfwOverlay from "@/components/NsfwOverlay";
import SLink from "@/components/ui/SLink";
import { getProxyImageURL } from "@/utils/parseImage";
import { proxifyImageUrl } from "@/utils/proxifyUrl";
import { Card } from "@heroui/card";
import Image from "next/image";
import { memo, useState } from "react";
import { twMerge } from "tailwind-merge";
import ImageViewerModal from "@/components/body/ImageViewerModal";
import { useDisclosure } from "@heroui/modal";

interface Props {
  size?: "xs" | "sm";
  src?: string | null;
  transparent?: boolean;
  thumbnail?: boolean;
  className?: string;
  noCard?: boolean;
  alt?: string;
  isNsfw?: boolean;
  targetUrl?: string;
  onLoadCompleted?: () => void;
}
function getStaticFrameFromGif(gifUrl: string): string {
  // Append parameter to get first frame (service-dependent)
  return `${gifUrl?.replace("0x0", "640x0")}`;
}
export default memo(function CommentCover(props: Props) {
  let { size, src, thumbnail, className, noCard, alt, isNsfw, targetUrl } =
    props;
  const [isFetching, setIsFetching] = useState(true);
  const [show, setShow] = useState(!isNsfw);
  const imageDisclosure = useDisclosure();

  function onLoadCompleted() {
    if (isFetching) setIsFetching(false);
    props.onLoadCompleted && props.onLoadCompleted();
  }
  const isGif = src?.includes(".gif");

  return !!src ? (
    <>
      {noCard ? (
        <div className="relative">
          <Image
            unoptimized
            onClick={imageDisclosure.onOpen}
            className={twMerge(
              " cursor-zoom-in",
              isFetching && "bg-background/50",
              className,
              show ? "" : "blur-lg"
            )}
            alt={alt || "image"}
            src={src}
            height={0}
            width={640}
            onLoad={onLoadCompleted}
            onError={onLoadCompleted}
            style={{
              width: "auto",
              height: "auto",
              objectFit: "contain",
            }}
          />
          {!show && <NsfwOverlay onOpen={setShow} />}
        </div>
      ) : (
        <Card
          radius="none"
          as={targetUrl ? SLink : undefined}
          href={targetUrl}
          className={twMerge(
            isFetching ? "bg-background/50" : "bg-transparent",
            className
          )}
        >
          {thumbnail ? (
            <div className="relative">
              <Image
                alt={alt || "image"}
                src={isGif ? getStaticFrameFromGif(src) : src}
                height={0}
                width={640}
                quality={60}
                className={twMerge(show ? "" : "blur-lg")}
                onLoad={onLoadCompleted}
                onError={onLoadCompleted}
                style={{
                  width: "100%",
                  objectFit: "cover",
                  height: "auto",
                }}
              />
              {isNsfw && <NsfwOverlay onOpen={setShow} />}
            </div>
          ) : (
            <picture
              className="flex flex-col relative overflow-hidden items-center justify-center"
              style={{
                width:
                  size === "xs" ? "130" : size === "sm" ? "220px" : undefined,
                height:
                  size === "xs" ? "70" : size === "sm" ? "120px" : undefined,
              }}
            >
              <Image
                src={isGif ? getStaticFrameFromGif(src) : src}
                width={size === "xs" ? 130 : size === "sm" ? 220 : 200}
                height={size === "xs" ? 70 : size === "sm" ? 120 : 160}
                alt={alt || "image"}
                onLoad={onLoadCompleted}
                onError={onLoadCompleted}
                className={twMerge(show ? "" : "blur-md", "rounded-md")}
                style={{
                  // width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              {!show && <NsfwOverlay onOpen={setShow} />}
            </picture>
          )}
        </Card>
      )}

      <ImageViewerModal
        alt={alt}
        isOpen={imageDisclosure.isOpen}
        onOpenChange={imageDisclosure.onOpenChange}
        src={getProxyImageURL(proxifyImageUrl(src, "", true), "large")}
      />
    </>
  ) : null;
});
