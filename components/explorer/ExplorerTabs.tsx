"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Activity,
  Database,
  LayoutDashboard,
  ListOrdered,
  Search,
  Trophy,
  Users,
} from "lucide-react";
import STabs from "@/components/ui/STabs";
import { useDeviceInfo } from "@/hooks/redux/useDeviceInfo";
import ExplorerActivityCharts from "./ExplorerActivityCharts";
import ExplorerStatistics from "./ExplorerStatistics";
import ExplorerContent from "./ExplorerContent";
import ExplorerLeaderboardsSection from "./ExplorerLeaderboardsSection";
import ExplorerParametersSection from "./ExplorerParametersSection";
import ExplorerLookupTabs from "./ExplorerLookupTabs";

const TAB_IDS = [
  "overview",
  "activity",
  "statistics",
  "content",
  "leaderboards",
  "parameters",
  "lookup",
];

interface ExplorerTabItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

/**
 * The explorer's tab shell.
 *
 * - Only the selected panel mounts, so each tab's data is fetched on first
 *   activation and nothing else (network-efficient by construction).
 * - The Overview panel's content is server-rendered and passed in as a prop,
 *   so the initial HTML still carries real stats + links for crawlers.
 * - The active tab mirrors into ?tab= for shareable deep links.
 */
export default function ExplorerTabs({
  initialTab,
  initialLookup,
  initialQuery,
  overview,
}: {
  initialTab: string;
  initialLookup: string;
  initialQuery?: string;
  overview: React.ReactNode;
}) {
  const t = useTranslations("Explorer");
  const { isMobile } = useDeviceInfo();
  const [selected, setSelected] = useState(
    TAB_IDS.includes(initialTab) ? initialTab : "overview",
  );

  // Same-route client navigations (e.g. the search fallback pushing
  // ?tab=lookup) deliver a new initialTab to the ALREADY-MOUNTED shell —
  // state initializers don't re-run, so mirror the prop explicitly.
  useEffect(() => {
    if (TAB_IDS.includes(initialTab)) setSelected(initialTab);
  }, [initialTab]);

  const tabs: ExplorerTabItem[] = [
    {
      id: "overview",
      title: t("tabs.overview"),
      icon: <LayoutDashboard size={16} />,
      content: overview,
    },
    {
      id: "activity",
      title: t("tabs.activity"),
      icon: <Activity size={16} />,
      content: <ExplorerActivityCharts />,
    },
    {
      id: "statistics",
      title: t("tabs.statistics"),
      icon: <ListOrdered size={16} />,
      content: <ExplorerStatistics />,
    },
    {
      id: "content",
      title: t("tabs.content"),
      icon: <Users size={16} />,
      content: <ExplorerContent />,
    },
    {
      id: "leaderboards",
      title: t("tabs.leaderboards"),
      icon: <Trophy size={16} />,
      content: <ExplorerLeaderboardsSection />,
    },
    {
      id: "parameters",
      title: t("tabs.parameters"),
      icon: <Database size={16} />,
      content: <ExplorerParametersSection />,
    },
    {
      id: "lookup",
      title: t("tabs.lookup"),
      icon: <Search size={16} />,
      content: (
        <ExplorerLookupTabs initialSub={initialLookup} initialQuery={initialQuery} />
      ),
    },
  ];

  const select = (key: React.Key) => {
    const id = key.toString();
    setSelected(id);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", id);
      if (id !== "lookup") url.searchParams.delete("sub");
      window.history.replaceState(null, "", url.toString());
    }
  };

  return (
    <STabs
      aria-label="Explorer sections"
      color="primary"
      variant="bordered"
      selectedKey={selected}
      onSelectionChange={select}
      items={tabs}
      classNames={{
        tabList:
          "gap-1 sm:gap-2 w-full relative border-b border-default-200/60 dark:border-default-100/50 px-0 overflow-x-auto",
        tab: "px-3 data-[hover=true]:opacity-80",
        cursor: "bg-primary",
        panel: "px-0 py-5",
        tabContent: "overflow-x-scroll!",
      }}
      tabTitle={(tab) => (
        <div className="flex items-center space-x-2 whitespace-nowrap">
          {tab.icon}
          {!isMobile || selected === tab.id ? <span>{tab.title}</span> : null}
        </div>
      )}
    >
      {(tab) => tab.content}
    </STabs>
  );
}
