import MainWrapper from "@/components/wrappers/MainWrapper";
import React from "react";
import HomeCarousel from "@/components/carousal/HomeCarousal";
import { Metadata } from "next";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <MainWrapper topContent={<HomeCarousel />}>{children}</MainWrapper>;
}

export async function generateMetadata({ params }): Promise<Metadata> {
  let { category } = await params;
  category = category?.toLowerCase();
  if (!category) category = "trending";
  const capCat = category.charAt(0).toUpperCase() + category.slice(1);
  const pageTitle = `${capCat} topics`;
  const pageDescription = `Explore ${category} discussions on a user-owned social network. ${capCat} topics cover a wide range of interests and perspectives, providing valuable insights and lively conversations.`;

  return {
    title: pageTitle,
    description: pageDescription,
  };
}
