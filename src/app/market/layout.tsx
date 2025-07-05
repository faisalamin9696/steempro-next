import MainWrapper from "@/components/wrappers/MainWrapper";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: `SteemPro Market – Buy, Sell, and Discover Digital Assets on the Steem Blockchain`,
  description: `Explore the SteemPro Market – a decentralized marketplace to trade digital assets, tokens, NFTs, and services on the Steem blockchain. Fast, secure, and user-driven.`,
  keywords: [
    "steempro market",
    "steem marketplace",
    "steem blockchain trading",
    "steem nft",
    "steem token sale",
    "digital assets steem",
    "steem commerce",
    "decentralized marketplace",
    "steem market app",
    "steempro buy sell",
  ].join(", "),
};

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <MainWrapper>{children}</MainWrapper>;
}
