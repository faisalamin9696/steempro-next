import { getResizedAvatar } from "@/utils/image";
import { Avatar, AvatarProps } from "@heroui/avatar";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { useMemo } from "react";
import { getCachedAvatarUrl, setCachedAvatarUrl } from "@/utils/avatarCache";

interface SAvatarProps extends Omit<AvatarProps, "size"> {
  username: string;
  size?: "xxs" | "xs" | "sm" | "md" | "lg" | "xl" | number;
  quality?: "small" | "medium" | "large";
  className?: string;
  showLink?: boolean;
}

const sizeMap = {
  xxs: 20,
  xs: 25,
  sm: 40,
  md: 70,
  lg: 100,
  xl: 160,
} as const;

function SAvatar({
  username,
  size = "sm",
  quality = "small",
  className = "",
  showLink = true,
  ...rest
}: SAvatarProps) {
  const imageSize = typeof size === "number" ? size : sizeMap[size];

  const src = useMemo(() => {
    if (!username) return undefined;

    const cacheKey = `${username}:${quality}`;
    const cached = getCachedAvatarUrl(cacheKey);
    if (cached) return cached;

    const url = getResizedAvatar(username, quality);
    setCachedAvatarUrl(cacheKey, url);
    return url;
  }, [username, quality]);

  const avatarContent = (
    <Avatar
      name={username}
      showFallback
      className={twMerge(className, "bg-transparent")}
      style={{
        width: imageSize,
        height: imageSize,
        minWidth: imageSize,
        minHeight: imageSize,
      }}
      src={src}
      alt={`${username}'s avatar`}
      radius="md"
      {...rest}
    />
  );

  if (!showLink) {
    return avatarContent;
  }

  return (
    <Link href={`/@${username}`} className="inline-block">
      {avatarContent}
    </Link>
  );
}

export default SAvatar;
