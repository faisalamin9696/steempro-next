import Link, { LinkProps } from "next/link";

type BaseProps = Omit<LinkProps, "children" | "href"> & {
  title: string | React.ReactNode;
  className?: string;
};

type WithComment = {
  comment: Feed | Post;
  href?: never;
};

type WithHref = {
  href: string;
  comment?: never;
};

export type Props = BaseProps & (WithComment | WithHref);

function PostLink({ title, className, comment, href, ...rest }: Props) {
  return (
    <Link
      {...rest}
      className={`hover:text-blue-500 transition-colors delay-75 ${className ?? ""
        }`}
      href={comment ? `/@${comment.author}/${comment.permlink}` : href}
    >
      {title}
    </Link>
  );
}

export default PostLink;
