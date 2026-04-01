import { getMetadata } from "@/utils/metadata";
import { Metadata } from "next";

export const metadata: Metadata = getMetadata.shortsSubmit();

function layout({ children }: { children: React.ReactNode }) {
  return children;
}

export default layout;
