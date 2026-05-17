import { getMetadata } from "@/utils/metadata";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = getMetadata.steemHeights();

function layout({ children }: { children: React.ReactNode }) {
  return children;
}

export default layout;
