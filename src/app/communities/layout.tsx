import MainWrapper from "@/components/wrappers/MainWrapper";
import { getMetadata } from "@/utils/metadata";
import { Metadata } from "next";
import React from "react";
const { title, description, keywords } = getMetadata.communities();

export const metadata: Metadata = {
  title,
  description,
  keywords: keywords.join(", "),
};

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <MainWrapper>{children}</MainWrapper>;
}
