"use client";

import { useEffect, useState } from "react";
import { ArrowRightLeft, Box, User } from "lucide-react";
import { useTranslations } from "next-intl";
import STabs from "@/components/ui/STabs";
import { useDeviceInfo } from "@/hooks/redux/useDeviceInfo";
import ExplorerBlockView from "./ExplorerBlockView";
import ExplorerTransactionViewer from "./ExplorerTransactionViewer";
import ExplorerAccountLookup from "./ExplorerAccountLookup";

const LOOKUP_IDS = ["blocks", "transactions", "accounts"];

/**
 * Block / transaction / account lookup — the hands-on part of the explorer,
 * rendered as the last dashboard tab. The active sub-tab is deep-linkable
 * via ?sub= (search fallbacks push ?tab=lookup&sub=accounts).
 */
export default function ExplorerLookupTabs({
  initialSub,
  initialQuery,
}: {
  initialSub?: string;
  initialQuery?: string;
}) {
  const t = useTranslations("Explorer");
  const [selectedKey, setSelectedKey] = useState(
    initialSub && LOOKUP_IDS.includes(initialSub) ? initialSub : "blocks",
  );
  const { isMobile } = useDeviceInfo();

  // Mirror same-route navigation updates (?sub= pushed while mounted).
  useEffect(() => {
    if (initialSub && LOOKUP_IDS.includes(initialSub)) setSelectedKey(initialSub);
  }, [initialSub]);

  const tabs = [
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
      content: <ExplorerAccountLookup initialQuery={initialQuery} />,
    },
  ];

  const select = (key: React.Key) => {
    const id = key.toString();
    setSelectedKey(id);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", "lookup");
      url.searchParams.set("sub", id);
      window.history.replaceState(null, "", url.toString());
    }
  };

  return (
    <STabs
      aria-label="Explorer lookup"
      color="primary"
      variant="bordered"
      selectedKey={selectedKey}
      onSelectionChange={select}
      items={tabs}
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
          {!isMobile || selectedKey === tab.id ? <span>{tab.title}</span> : null}{" "}
        </div>
      )}
    >
      {(tab) => tab.content}
    </STabs>
  );
}
