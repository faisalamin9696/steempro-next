import PageHeader from "@/components/ui/PageHeader";
import MainWrapper from "@/components/wrappers/MainWrapper";
import { ShieldUser } from "lucide-react";
import { Metadata } from "next";
import React from "react";

import { getMetadata } from "@/utils/metadata";

export const metadata: Metadata = getMetadata.privacyPolicy();

function layout({ children }: { children: React.ReactNode }) {
  return (
    <MainWrapper className="flex flex-col gap-6 pb-4">
      <PageHeader
        icon={ShieldUser}
        title="Privacy Policy"
        description="Learn how we protect your data, handle your security keys, and maintain your privacy on the Steem blockchain."
        color="success"
      />

      {children}
    </MainWrapper>
  );
}

export default layout;
