import PageHeader from "@/components/ui/PageHeader";
import MainWrapper from "@/components/wrappers/MainWrapper";
import { getMetadata } from "@/utils/metadata";
import { Settings } from "lucide-react";
import { Metadata } from "next";

import { getTranslations } from "next-intl/server";

export const metadata: Metadata = getMetadata.settings();

async function layout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("Settings");
  return (
    <MainWrapper className="flex flex-col gap-6">
      <PageHeader
        icon={Settings}
        title={t("title")}
        description={t("description")}
      />

      {children}
    </MainWrapper>
  );
}

export default layout;
