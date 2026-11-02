import PageHeader from "@/components/ui/PageHeader";
import MainWrapper from "@/components/wrappers/MainWrapper";
import { Smartphone } from "lucide-react";
import { Metadata } from "next";
import React from "react";

import { getMetadata } from "@/utils/metadata";

export const metadata: Metadata = getMetadata.privacyPolicySteemAuth();

function layout({ children }: { children: React.ReactNode }) {
  return (
    <MainWrapper className="flex flex-col gap-6 pb-4">
      <PageHeader
        icon={Smartphone}
        title="SteemAuth Privacy Policy"
        description="What SteemAuth collects — nothing — how signing stays on your phone, and how to delete everything we store from Settings."
        color="success"
      />

      {children}
    </MainWrapper>
  );
}

export default layout;
