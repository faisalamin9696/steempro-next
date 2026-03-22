"use client";

import { useState } from "react";
import { Activity, ArrowRightLeft, Box, Layers, User } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import ExplorerGlobalStats from "@/components/explorer/ExplorerGlobalStats";
import ExplorerBlockView from "@/components/explorer/ExplorerBlockView";
import ExplorerTransactionViewer from "@/components/explorer/ExplorerTransactionViewer";
import ExplorerRecentBlocks from "@/components/explorer/ExplorerRecentBlocks";
import ExplorerAccountLookup from "@/components/explorer/ExplorerAccountLookup";
import STabs from "@/components/ui/STabs";
import { useDeviceInfo } from "@/hooks/redux/useDeviceInfo";
import { useTranslations } from "next-intl";

export default function ExplorerPage() {
  const t = useTranslations("Explorer");
  const [selectedKey, setSelectedKey] = useState("overview");
  const { isMobile } = useDeviceInfo();

  const explorerTabs = [
    {
      id: "overview",
      title: t("tabs.overview"),
      icon: <Activity size={16} />,
      content: (
        <div className="space-y-8">
          <ExplorerGlobalStats />
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                <Box size={18} />
              </div>
              <h2 className="font-bold text-lg">{t("recentBlocks")}</h2>
            </div>
            <ExplorerRecentBlocks />
          </div>
        </div>
      ),
    },
    {
      id: "blocks",
      title: t("tabs.blocks"),
      icon: <Box size={16} />,
      content: <ExplorerBlockView />,
    },
    {
      id: "transactions",
      title: t("tabs.transactions"),
      icon: <ArrowRightLeft size={16} />,
      content: <ExplorerTransactionViewer />,
    },
    {
      id: "accounts",
      title: t("tabs.accounts"),
      icon: <User size={16} />,
      content: <ExplorerAccountLookup />,
    },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Page Header */}
      <PageHeader
        title={t("title")}
        description={t("description")}
        icon={Layers}
        color="primary"
      />

      {/* Tabs */}
      <STabs
        aria-label="Explorer sections"
        color="primary"
        variant="bordered"
        selectedKey={selectedKey}
        onSelectionChange={(key) => setSelectedKey(key.toString())}
        items={explorerTabs}
        classNames={{
          tabList:
            "gap-4 w-full relative border-b border-default-200/60 dark:border-default-100/50 px-0",
          tab: "data-[hover=true]:opacity-80",
          cursor: "bg-primary",
          panel: "px-0 py-4",
          tabContent: "overflow-x-scroll!",
        }}
        tabTitle={(tab) => (
          <div className="flex items-center space-x-2">
            {tab.icon}
            {!isMobile || selectedKey === tab.id ? (
              <span>{tab.title}</span>
            ) : null}{" "}
          </div>
        )}
      >
        {(tab) => tab.content}
      </STabs>
    </div>
  );
}
