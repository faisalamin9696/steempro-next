import MainWrapper from "@/components/wrappers/MainWrapper";
import { getMetadata } from "@/utils/metadata";
import { Metadata } from "next";
import React from "react";

const { title, description } = getMetadata.proposals();
export const metadata: Metadata = {
  title,
  description,
};

function Layout({ children }) {
  return <MainWrapper>{children}</MainWrapper>;
}

export default Layout;
