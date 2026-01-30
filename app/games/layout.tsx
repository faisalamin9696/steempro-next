import MainWrapper from "@/components/wrappers/MainWrapper";
import { getMetadata } from "@/utils/metadata";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = getMetadata.games();

function layout({ children }: { children: React.ReactNode }) {
  return <MainWrapper className="pb-4 px-4">{children}</MainWrapper>;
}

export default layout;
