import clsx from "clsx";
import Link from "next/link";
import { twMerge } from "tailwind-merge";

interface Props {
  className?: string;
  content?: string;
  tag: string;
  onlyText?: boolean;
  isDisabled?: boolean;
}
export default function STag(props: Props) {
  const { className, content, tag, onlyText, isDisabled } = props;
  return (
    <Link
      title={tag}
      className={twMerge(
        isDisabled ? "pointer-events-none" : "",
        "text-default-900 transition-all delay-75",
        onlyText
          ? " hover:text-blue-500"
          : "text-tiny rounded-full bg-background/60 backdrop-blur-lg hover:bg-default/100 px-2 py-1",
        className
      )}
      href={`/trending/${tag}`}
    >
      {content ?? tag}
    </Link>
  );
}
