import MainWrapper from "@/components/wrappers/MainWrapper";
import React from "react";
import HomeCarousel from "@/components/carousal/HomeCarousal";
import { Metadata } from "next";
import { getMetadata } from "@/utils/metadata";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <MainWrapper topContent={<HomeCarousel />}>{children}</MainWrapper>;
}

export async function generateMetadata({ params }): Promise<Metadata> {
  let { category } = await params;
  const { title, description } = getMetadata.home(category);

  return {
    title,
    description,
  };
}
