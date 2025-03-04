import { Badge } from "@heroui/badge";
import STooltip from "./STooltip";
import { getResizedAvatar } from "@/libs/utils/image";
import Image from "next/image";
import { twMerge } from "tailwind-merge";

interface Props {
  username: string;
  quality?: "small" | "large" | "medium";
  onPress?: () => void;
  badge?: string | number;
  border?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}
export default function BadgeAvatar(props: Props) {
  const { username, size, quality, onPress, badge, border, className } = props;
  const imageSize =
    size === "xl" ? 160 : size === "lg" ? 100 : size === "md" ? 70 : 50;
  return (
    <STooltip content={badge ? `${"Reputation score"}: ${badge}` : username}>
      <Badge
        content={typeof badge === "number" ? badge.toFixed(0) : badge}
        className={twMerge(badge ? "" : "hidden")}
        color="primary"
        shape="circle"
      >
        <Image
          onError={(e) => {
            e.currentTarget.src = "/image-placeholder.png";
          }}
          alt=""
          height={imageSize}
          width={imageSize}
          onClick={onPress}
          src={`${getResizedAvatar(username, quality ?? "small")}`}
          className={twMerge(
            " shadow-lg rounded-full",
            border && "border",
            className
          )}
        />
      </Badge>
    </STooltip>
  );
}
