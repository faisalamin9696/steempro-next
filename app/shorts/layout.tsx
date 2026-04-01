import { Metadata } from "next";
import { getMetadata } from "@/utils/metadata";

export const metadata: Metadata = getMetadata.shorts();

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
