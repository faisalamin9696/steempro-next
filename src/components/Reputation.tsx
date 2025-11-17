import { Card } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
import { twMerge } from "tailwind-merge";

export default function Reputation({
  reputation,
  decimal,
  sm,
  className,
  variant,
}: {
  reputation: string | number;
  decimal?: number;
  sm?: boolean;
  className?: string;
  variant?:
    | "light"
    | "flat"
    | "shadow"
    | "solid"
    | "bordered"
    | "faded"
    | "dot"
    | undefined;
}) {
  return (
    <Chip
      variant={variant ?? "flat"}
      size="sm"
      radius="sm"
      className={twMerge("!normal-case", className)}
    >
      <p className={sm ? " text-tiny" : ""}>
        {Number(reputation)?.toFixed(decimal ?? 0)}{" "}
      </p>
    </Chip>
  );
}
