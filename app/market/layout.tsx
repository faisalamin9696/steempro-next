import PageHeader from "@/components/ui/PageHeader";
import MainWrapper from "@/components/wrappers/MainWrapper";
import { getMetadata } from "@/utils/metadata";
import { Chip } from "@heroui/chip";
import { CandlestickChart } from "lucide-react";
import { Metadata } from "next";
import React from "react";

import { getTranslations } from "next-intl/server";

export const metadata: Metadata = getMetadata.market();

async function layout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("Market");

  return (
    <MainWrapper className="flex flex-col gap-6 pb-4">
      <PageHeader
        title={t("title")}
        description={t("description")}
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
