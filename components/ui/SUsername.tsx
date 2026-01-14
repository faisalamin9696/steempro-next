import Link from "next/link";
import { twMerge } from "tailwind-merge";

function SUsername({
  username,
  className,
}: {
  username: string;
  className?: string;
}) {
  const cleanName = username?.replace("@", ""); // remove leading @

  return (
    <Link
      href={`/@${cleanName}`}
      className={twMerge(
        "transition-colors delay-75 hover:text-blue-500",
        className
      )}
    >
      {username}
    </Link>
  );
}

export default SUsername;
