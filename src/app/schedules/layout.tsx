import MainWrapper from "@/components/wrappers/MainWrapper";
import React from "react";
import { Metadata } from "next";
import { getMetadata } from "@/utils/metadata";

const { title, description } = getMetadata.schedules();
export const metadata: Metadata = {
  title,
  description,
};

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <MainWrapper>{children}</MainWrapper>;
}
