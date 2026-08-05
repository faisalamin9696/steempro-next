import NextLink from "next/link";
import { ComponentProps } from "react";

export const Link = ({
  prefetch = false,
  ...props
}: ComponentProps<typeof NextLink>) => {
  return <NextLink prefetch={prefetch} {...props} />;
};

export default Link;
