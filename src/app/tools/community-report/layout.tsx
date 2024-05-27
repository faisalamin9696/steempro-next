import MainWrapper from "@/components/wrappers/MainWrapper";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: `SteemPro Community Report Tool - Analyze & Monitor Your Steem Communities`,
  description: `Discover the SteemPro Community Report Tool, designed to help you analyze and monitor your Steem communities. Gain insights into community activity, member engagement, and growth trends to make informed decisions and foster a thriving community. Ideal for community leaders and active members.`,
};

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="main">
      <MainWrapper>{children}</MainWrapper>
    </main>
  );
}