import MainWrapper from "@/components/wrappers/MainWrapper";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: `SteemCN Author Report Tool - Track & Analyze Author Performance`,
  description: `Utilize the SteemCN Author Report Tool to track and analyze author performance on the Steem blockchain. Get detailed insights into post activity, engagement metrics, and earnings to help authors improve their content strategy and increase their reach. Perfect for authors looking to optimize their performance.`,
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
