import { getResizedAvatar } from "@/libs/utils/image";
import Image from "next/image";
import SLink from "./SLink";
import { twMerge } from "tailwind-merge";

interface Props {
  username: string;
  quality?: "small" | "large" | "medium";
  onPress?: (event) => void;
  border?: boolean;
  className?: string;
  size?: "xs" | "1xs" | "sm" | "md" | "lg" | "xl";
  borderColor?: string;
  onlyImage?: boolean;
}
export default function SAvatar(props: Props) {
  const {
    username,
    size,
    quality,
    onPress,
    border,
    borderColor,
    className,
    onlyImage,
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
      onError={(e) => {
        e.currentTarget.src = "/image-placeholder.png";
      }}
      alt=""
      height={imageSize}
      width={imageSize}
      style={{
        borderColor: borderColor,
      }}
      src={`${getResizedAvatar(username, quality ?? "small")}`}
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
