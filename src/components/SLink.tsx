"use client";

import Link, { LinkProps } from "next/link";
import React from "react";

type SLinkProps = LinkProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: React.ReactNode;
  };

const SLink = ({ href, children, ...props }: SLinkProps) => {
  return (
    <Link prefetch={false} href={href as string} {...props}>
      {children}
    </Link>
  );
};

export default SLink;
