import { getResizedAvatar } from "@/utils/parseImage";
import Image from "next/image";
import SLink from "./SLink";
import { twMerge } from "tailwind-merge";
import { useEffect, useState } from "react";

interface Props {
  username?: string;
  loadSize?: "small" | "medium" | "large";
  onPress?: (event) => void;
  border?: boolean;
  className?: string;
  size?: "xxs" | "xs" | "1xs" | "sm" | "md" | "lg" | "xl";
  borderColor?: string;
  onlyImage?: boolean;
  quality?: number;
  alt?: string;
  content?: React.ReactNode | string;
  linkClassName?: string;
}
export default function SAvatar(props: Props) {
  const {
    username,
    size,
    loadSize,
    onPress,
    border,
    borderColor,
    className,
    onlyImage,
    quality,
    alt,
    content,
    linkClassName,
  } = props;
  const imageSize =
    size === "xl"
      ? 160
      : size === "lg"
      ? 100
      : size === "md"
      ? 70
      : size === "sm"
      ? 45
      : size === "1xs"
      ? 35
      : size === "xs"
      ? 25
      : size === "xxs"
      ? 20
      : 60;

  if (!username) return null;

  const [imgSrc, setImgSrc] = useState(
    getResizedAvatar(username, loadSize ?? "small")
  );

  useEffect(() => {
    setImgSrc(getResizedAvatar(username, loadSize ?? "small"));
  }, [username]);

  const avatarImage = (
    <Image
      title={username}
      quality={quality}
      onError={() => setImgSrc("/image-placeholder.png")}
      alt={alt ?? ""}
      height={imageSize}
      width={imageSize}
      style={{ borderColor }}
      src={imgSrc}
      className={twMerge(
        "max-w-none shadow-lg rounded-full",
        border && "border",
        className
      )}
    />
  );

  return onlyImage ? (
    avatarImage
  ) : (
    <SLink
      href={`/@${username}`}
      onClick={onPress}
      className={twMerge("flex flex-row items-center gap-1", linkClassName)}
    >
      {avatarImage}{" "}
      <p className="transition-colors hover:text-blue-500">{content}</p>
    </SLink>
  );
}
