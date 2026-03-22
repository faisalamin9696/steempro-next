import MainWrapper from "@/components/wrappers/MainWrapper";
import PageHeader from "@/components/ui/PageHeader";
import { Users } from "lucide-react";
import { getMetadata } from "@/utils/metadata";
import { Metadata } from "next";
import { Suspense } from "react";
import LoadingStatus from "@/components/LoadingStatus";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = getMetadata.communities();

async function layout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("Communities");

  return (
    <MainWrapper className="flex flex-col gap-6">
      <PageHeader
        icon={Users}
        title={t("title")}
        description={t("headerDesc")}
      />
      <Suspense fallback={<LoadingStatus />}>{children}</Suspense>
    </MainWrapper>
  );
}

export default layout;
