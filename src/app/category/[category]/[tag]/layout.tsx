import MainWrapper from "@/components/wrappers/MainWrapper";
import { getMetadata } from "@/utils/metadata";
import { Metadata } from "next";
import React from "react";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MainWrapper>
      <div className=" flex flex-col">{children}</div>
    </MainWrapper>
  );
}

export async function generateMetadata({ params }): Promise<Metadata> {
  let { category, tag } = await params;
  const { title, description, keywords } = getMetadata.category(category, tag);

  return {
    title,
    description,
    keywords: keywords.join(", "),
  };
}
