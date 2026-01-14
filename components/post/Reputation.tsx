import { Chip, ChipProps } from "@heroui/chip";
import { twMerge } from "tailwind-merge";

interface Props extends Omit<ChipProps, "className"> {
  value: string | number;
  className?: string;
}

const Reputation = ({ value, className, ...props }: Props) => (
  <Chip
    title={`Reputation: ${value?.toLocaleString()}`}
    size="sm"
    variant="flat"
    color="default"
    {...props}
    className={twMerge(
      "min-w-0 h-5 items-center p-0 px-1 text-muted",
      className
    )}
  >
    {Math.round(Number(value))}
  </Chip>
);

export default Reputation;
