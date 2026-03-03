import MainWrapper from "@/components/wrappers/MainWrapper";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Blockchain Explorer",
  description:
    "Explore the Steem blockchain in real-time. Browse blocks, lookup accounts, view transactions, track witnesses, and monitor global chain properties.",
};

function ExplorerLayout({ children }: { children: React.ReactNode }) {
  return <MainWrapper>{children}</MainWrapper>;
}

export default ExplorerLayout;
