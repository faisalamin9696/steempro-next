import PageHeader from "@/components/ui/PageHeader";
import MainWrapper from "@/components/wrappers/MainWrapper";
import { getMetadata } from "@/utils/metadata";
import { Settings } from "lucide-react";
import { Metadata } from "next";
import React from "react";

const { title, description } = getMetadata.settings();
export const metadata: Metadata = {
  title,
  description,
};

function layout({ children }: { children: React.ReactNode }) {
  return (
    <MainWrapper className="flex flex-col gap-6">
      <PageHeader
        icon={Settings}
        title="Settings"
        description="Manage your application preferences and Steem profile"
      />

      {children}
    </MainWrapper>
  );
}

export default layout;
