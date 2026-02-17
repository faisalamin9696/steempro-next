import PageHeader from "@/components/ui/PageHeader";
import MainWrapper from "@/components/wrappers/MainWrapper";
import { getMetadata } from "@/utils/metadata";
import { Chip } from "@heroui/chip";
import { CandlestickChart } from "lucide-react";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = getMetadata.market();

function layout({ children }: { children: React.ReactNode }) {
  return (
    <MainWrapper className="flex flex-col gap-6 pb-4">
      <PageHeader
        title="Market"
        description="Trade STEEM with SBD instantly"
        icon={CandlestickChart}
        titleEndContent={
          <Chip variant="flat" color="primary" className="font-bold">
            STEEM/SBD
          </Chip>
        }
      />
      {children}
    </MainWrapper>
  );
}

export default layout;
