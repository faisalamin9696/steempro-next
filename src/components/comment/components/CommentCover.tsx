import NsfwOverlay from "@/components/NsfwOverlay";
import { Card } from "@nextui-org/card";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { memo, useState } from "react";

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

  return src != null ? (
    noCard ? (
      <div className="relative">
        <Image
          className={clsx(
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
        as={targetUrl ? Link : undefined}
        href={targetUrl}
        className={clsx(
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
          <div className="relative">
            <Image
              src={src}
              width={size === "xs" ? 130 : size === "sm" ? 220 : 200}
              height={size === "xs" ? 70 : size === "sm" ? 120 : 160}
              alt={alt || "image"}
              onLoad={onLoadCompleted}
              onError={onLoadCompleted}
              className={show ? "" : "blur-md"}
              //         sizes={`(max-width: 768px) 100vw,
              //    (max-width: 1200px) 50vw,
              //    33vw`}
              style={{
                width:
                  size === "xs" ? "130" : size === "sm" ? "220px" : undefined,
                height:
                  size === "xs" ? "70" : size === "sm" ? "120px" : undefined,

                objectFit: size ? "cover" : undefined,
              }}
            />
            {!show && <NsfwOverlay onOpen={setShow} />}
          </div>
        )}
      </Card>
    )
  ) : null;
});
