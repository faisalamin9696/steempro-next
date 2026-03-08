import MainWrapper from "@/components/wrappers/MainWrapper";
import { Landmark } from "lucide-react";
import React from "react";
import { CheckCircle, XCircle } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { getMetadata } from "@/utils/metadata";
import { Metadata } from "next";

export const metadata: Metadata = getMetadata.witnesses();

async function layout({ children }: { children: React.ReactNode }) {
  return (
    <MainWrapper className="flex flex-col gap-6">
      <div className="flex flex-col items-start gap-4">
        <PageHeader
          icon={Landmark}
          title="Witnesses"
          description="Vote for witnesses who maintain Steem nodes and secure the blockchain. You can vote for up to 30 witnesses."
        />

        <div className="flex items-center gap-2 text-sm text-muted self-end">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>Active</span>
          <XCircle className="h-4 w-4 text-warning ml-2" />
          <span>Disabled</span>
        </div>
      </div>
      {children}
    </MainWrapper>
  );
}

export default layout;
