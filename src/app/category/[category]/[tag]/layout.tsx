import MainWrapper from "@/components/wrappers/MainWrapper";
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
  category = category?.toLowerCase();
  tag = tag?.toLowerCase();
  // const capCat = category.charAt(0).toUpperCase() + category.slice(1);
  const pageTitle = `Latest #${tag} ${category} topics on the Internet`;
  const pageDescription = `Explore the latest ${category} discussions and topics related to #${tag} on the internet. Stay updated with the most recent conversations and insights.`;
  const keywords = [
    `SteemCN ${tag} ${category} content`,
    `Latest ${category} discussions on SteemCN`,
    `SteemCN #${tag} ${category} conversations`,
    `Insightful ${category} posts on SteemCN`,
    `Trending ${category} topics on SteemCN #${tag}`,
    `Popular ${category} debates – SteemCN ${tag}`,
    `SteemCN ${category} analysis & updates`,
    `#${tag} ${category} news from SteemCN`,
    `Engaging ${category} discussions – SteemCN ${tag}`,
  ];

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: keywords.join(", "),
  };
}
