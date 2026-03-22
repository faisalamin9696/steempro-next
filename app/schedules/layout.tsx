import MainWrapper from "@/components/wrappers/MainWrapper";
import PageHeader from "@/components/ui/PageHeader";
import { CalendarSearch } from "lucide-react";
import { Metadata } from "next";
import { getMetadata } from "@/utils/metadata";

import { getTranslations } from "next-intl/server";

export const metadata: Metadata = getMetadata.schedules();

async function layout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("Schedules");
  return (
    <MainWrapper className="flex flex-col gap-6">
      <PageHeader
        icon={CalendarSearch}
        title={t("title")}
        description={t("description")}
      />

      {children}
    </MainWrapper>
  );
}

export default layout;
