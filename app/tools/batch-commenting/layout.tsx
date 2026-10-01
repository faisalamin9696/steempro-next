import { getMetadata } from "@/utils/metadata";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = getMetadata.tool("batch-commenting");

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
