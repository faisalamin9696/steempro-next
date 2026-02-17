import MainWrapper from "@/components/wrappers/MainWrapper";
import { getMetadata } from "@/utils/metadata";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = getMetadata.proposals();

async function layout({ children }: { children: React.ReactNode }) {
  return <MainWrapper>{children}</MainWrapper>;
}

export default layout;
