import { twMerge } from "tailwind-merge";
import SLink from "./SLink";

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
    <SLink
      title={tag}
      className={twMerge(
        isDisabled ? "pointer-events-none" : "",
        "!text-default-600 transition-all delay-75 hover:underline",
        onlyText
          ? " hover:underline"
          : "text-tiny rounded-full bg-background/60 backdrop-blur-lg hover:bg-default/100 px-2 py-1",
        className
      )}
      href={`/trending/${tag}`}
    >
      <p>{content ?? tag}</p>
    </SLink>
  );
}
