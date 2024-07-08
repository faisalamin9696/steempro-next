import clsx from "clsx";
import Link from "next/link";

export default function STag({
  className,
  content,
  tag,
}: {
  className?: string;
  content?: string;
  tag: string;
}) {
  return (
    <Link
      title={tag}
      className={clsx("text-default-900 transition-all delay-75", className)}
      href={`/trending/${tag}`}
    >
      {content ?? tag}
    </Link>
  );
}
