import PageHeader from "@/components/ui/PageHeader";
import { Settings, Construction } from "lucide-react";
import React from "react";
import { useTranslations } from "next-intl";

export default function AccountCreationPage() {
  const t = useTranslations("AccountCreation");

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 pb-20 max-w-7xl">
      <PageHeader
        title={t("title")}
        description={t("description")}
        icon={Settings}
        color="danger"
      />

      <div className="flex flex-col flex-1 items-center justify-center p-12 text-center bg-content1 rounded-2xl border border-default-200">
        <Construction size={48} className="text-danger mb-4" />
        <h2 className="text-2xl font-bold mb-2">{t("comingSoon")}</h2>
        <p className="text-muted-foreground opacity-80 max-w-md">
          {t("featureDescription")}
        </p>
      </div>
    </div>
  );
}
