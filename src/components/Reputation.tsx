import { Tooltip } from "@heroui/tooltip";
import { twMerge } from "tailwind-merge";

export default function Reputation({
  reputation,
  decimal,
  sm,
  className,
}: {
  reputation: string | number;
  decimal?: number;
  sm?: boolean;
  className?: string;
}) {
  return (
    <Tooltip content={`${"Reputation score"}: ` + reputation}>
      <div
        className={twMerge(
          "!normal-case rounded-md py-[1px] px-[3px] text-sm bg-foreground/10 max-sm:text-xs text-default-900  shadow-md",
          className
        )}
      >
        <p className={sm ? " text-tiny" : ""}>
          {Number(reputation)?.toFixed(decimal ?? 0)}{" "}
        </p>
      </div>
    </Tooltip>
  );
}
