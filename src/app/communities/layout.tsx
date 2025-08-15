import MainWrapper from "@/components/wrappers/MainWrapper";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: `Communities on SteemCN - Join Engaging Discussions`,
  description: `Explore diverse communities on SteemCN, a user-owned social network. Join engaging discussions, share your passions, and connect with like-minded individuals.`,
  keywords: [
    "SteemCN communities",
    "user-owned social network",
    "engaging discussions",
    "connect with like-minded individuals",
    "share your passions",
    "diverse communities",
    "blockchain social network",
    "decentralized social media",
    "crypto social network",
    "SteemCN platform",
  ].join(", "),
};

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <MainWrapper>{children}</MainWrapper>;
}
