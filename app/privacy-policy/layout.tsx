import PageHeader from "@/components/ui/PageHeader";
import MainWrapper from "@/components/wrappers/MainWrapper";
import { ShieldUser } from "lucide-react";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how SteemPro protects your data and manages your security keys on the Steem blockchain.",
  keywords:
    "privacy policy SteemPro, privacy and policy, key management, security",
  alternates: {
    canonical: "https://www.steempro.com/privacy-policy",
  },
};

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
