import { IconType } from "react-icons";
import { Button } from "@heroui/button";
import { twMerge } from "tailwind-merge";

interface Props {
  children?: React.ReactNode;
  IconType: IconType;
  tooltip?: string;
  onPress?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  variant?:
    | "solid"
    | "bordered"
    | "light"
    | "flat"
    | "faded"
    | "shadow"
    | "ghost"
    | undefined;
  iconClassName?: string;
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger"
    | undefined;
  href?: string;
}
const IconButton = (props: Props) => {
  const {
    children,
    color,
    IconType,
    onPress,
    href,
    tooltip,
    className,
    iconClassName,
    size,
    isLoading,
    variant,
  } = props;

  return (
    <Button
      color={color}
      isLoading={isLoading}
      isIconOnly
      radius="full"
      className={twMerge(
        "text-default-900/60 data-[hover]:bg-foreground/10",
        className
      )}
      variant={variant ?? "light"}
      size={size}
      href={href}
      onPress={onPress}
    >
      <IconType
        className={twMerge(
          size === "sm" ? "text-sm" : size === "lg" ? "text-3xl" : " text-2xl",
          iconClassName
        )}
      />
    </Button>
  );
};

export default IconButton;
