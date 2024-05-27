import MainWrapper from "@/components/wrappers/MainWrapper";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: `SteemPro Mass Voting Tool - Efficiently Manage Your Votes`,
  description: `Utilize the SteemPro Mass Voting Tool to streamline your voting process on the Steem blockchain. Effortlessly manage and automate your votes, save time, and maximize your engagement. Perfect for active Steem users looking to enhance their voting efficiency.`,
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
