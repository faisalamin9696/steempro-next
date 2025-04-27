import { getResizedAvatar } from "@/libs/utils/parseImage";
import Image from "next/image";
import SLink from "./SLink";
import { twMerge } from "tailwind-merge";

interface Props {
  username: string;
  loadSize?: "small" | "medium" | "large";
  onPress?: (event) => void;
  border?: boolean;
  className?: string;
  size?: "xs" | "1xs" | "sm" | "md" | "lg" | "xl";
  borderColor?: string;
  onlyImage?: boolean;
  quality?: number;
  alt?: string;
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
    <SLink href={`/@${username}`} onClick={onPress}>
      {avatarImage}
    </SLink>
  );
}
