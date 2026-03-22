import MainWrapper from "@/components/wrappers/MainWrapper";
import { CheckCircle, Landmark, XCircle } from "lucide-react";
import React, { Suspense } from "react";
import LoadingStatus from "@/components/LoadingStatus";
import PageHeader from "@/components/ui/PageHeader";
import { getMetadata } from "@/utils/metadata";
import { Metadata } from "next";

import { getTranslations } from "next-intl/server";

export const metadata: Metadata = getMetadata.witnesses();

async function layout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("Witnesses");

  return (
    <MainWrapper className="flex flex-col gap-6">
      <div className="flex flex-col items-start gap-4">
        <PageHeader
          icon={Landmark}
          title={t("title")}
          description={t("description")}
        />

        <div className="flex items-center gap-2 text-sm text-muted self-end">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>Active</span>
          <XCircle className="h-4 w-4 text-warning ml-2" />
          <span>Disabled</span>
        </div>
      </div>

      <Suspense fallback={<LoadingStatus />}>{children}</Suspense>
    </MainWrapper>
  );
}

export default layout;
