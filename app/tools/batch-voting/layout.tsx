import { getMetadata } from "@/utils/metadata";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = getMetadata.tool("batch-voting");

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
