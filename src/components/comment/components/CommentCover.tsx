import NsfwOverlay from "@/components/NsfwOverlay";
import { Card } from "@nextui-org/card";
import clsx from "clsx";
import Image from "next/image";
import { memo, useState } from "react";

interface Props {
  sm?: boolean;
  src?: string | null;
  transparent?: boolean;
  thumbnail?: boolean;
  className?: string;
  noCard?: boolean;
  alt?: string;
  isNsfw?: boolean;
}
export default memo(function CommentCover(props: Props) {
  let { sm, src, thumbnail, className, noCard, alt, isNsfw } = props;
  const [isFetching, setIsFetching] = useState(true);
  const [show, setShow] = useState(!isNsfw);

  function onLoadCompleted() {
    if (isFetching) setIsFetching(false);
  }

  return src ? (
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
          height={640}
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
              height={640}
              width={640}
              quality={60}
              className={show ? "" : "blur-md"}
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
              width={sm ? 220 : 200}
              height={sm ? 120 : 160}
              alt={alt || "image"}
              onLoad={onLoadCompleted}
              onError={onLoadCompleted}
              className={show ? "" : "blur-md"}
              //         sizes={`(max-width: 768px) 100vw,
              //    (max-width: 1200px) 50vw,
              //    33vw`}
              style={{
                width: sm ? "220px" : undefined,
                height: sm ? "120px" : undefined,
                objectFit: sm ? "cover" : undefined,
              }}
            />
            {!show && <NsfwOverlay onOpen={setShow} />}
          </div>
        )}
      </Card>
    )
  ) : null;
});
