import MainWrapper from "@/components/wrappers/MainWrapper";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "SteemPro Proposals - Fund and Support Community Projects",
  description:
    "Explore and support community-driven projects on SteemPro. Vote for proposals that enhance the Steem ecosystem and help shape the future of decentralized social media.",
};

function Layout({ children }) {
  return <MainWrapper>{children}</MainWrapper>;
}

export default Layout;
