import { getResizedAvatar } from "@/utils/parseImage";
import Image from "next/image";
import SLink from "./SLink";
import { twMerge } from "tailwind-merge";

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

  const avatarImage = (
    <Image
      title={username}
      quality={quality}
      onError={(e) => {
        e.currentTarget.src = "/image-placeholder.png";
      }}
      alt={alt ?? ""}
      height={imageSize}
      width={imageSize}
      style={{
        borderColor: borderColor,
      }}
      src={`${getResizedAvatar(username, loadSize ?? "small")}`}
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
      {avatarImage} {content}
    </SLink>
  );
}
