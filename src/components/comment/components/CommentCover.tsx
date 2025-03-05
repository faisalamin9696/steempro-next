import NsfwOverlay from "@/components/NsfwOverlay";
import SLink from "@/components/SLink";
import { Card } from "@heroui/card";
import Image from "next/image";
import { memo, useState } from "react";
import { twMerge } from "tailwind-merge";

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
}
export default memo(function CommentCover(props: Props) {
  let { size, src, thumbnail, className, noCard, alt, isNsfw, targetUrl } =
    props;
  const [isFetching, setIsFetching] = useState(true);
  const [show, setShow] = useState(!isNsfw);

  function onLoadCompleted() {
    if (isFetching) setIsFetching(false);
  }

  return !!src ? (
    noCard ? (
      <div className="relative">
        <Image
          className={twMerge(
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
            width: "100%",
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
              src={src}
              height={0}
              width={640}
              quality={60}
              className={show ? "" : "blur-lg"}
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
              src={src}
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
    )
  ) : null;
});
