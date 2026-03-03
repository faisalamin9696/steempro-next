"use client";

import { Tab, Tabs } from "@heroui/tabs";
import { Activity, ArrowRightLeft, Box, Layers, User } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import ExplorerGlobalStats from "@/components/explorer/ExplorerGlobalStats";
import ExplorerBlockView from "@/components/explorer/ExplorerBlockView";
import ExplorerTransactionViewer from "@/components/explorer/ExplorerTransactionViewer";
import ExplorerRecentBlocks from "@/components/explorer/ExplorerRecentBlocks";
import ExplorerAccountLookup from "@/components/explorer/ExplorerAccountLookup";

export default function ExplorerPage() {
  return (
    <div className="space-y-6 pb-20">
      {/* Page Header */}
      <PageHeader
        title="Blockchain Explorer"
        description="Real-time Steem blockchain data, blocks, transactions & chain stats"
        icon={Layers}
        color="primary"
      />

      {/* Tabs */}
      <Tabs
        aria-label="Explorer sections"
        color="primary"
        variant="bordered"
        classNames={{
          tabList:
            "gap-4 w-full relative border-b border-default-200/60 dark:border-default-100/50 px-0",
          tab: "data-[hover=true]:opacity-80",
          cursor: "bg-primary",
          panel: "px-0 py-4",
        }}
      >
        <Tab
          key="overview"
          title={
            <div className="flex items-center gap-2">
              <Activity size={16} />
              <span>Overview</span>
            </div>
          }
        >
          <div className="space-y-8">
            <ExplorerGlobalStats />
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                  <Box size={18} />
                </div>
                <h2 className="font-bold text-lg">Recent Blocks</h2>
              </div>
              <ExplorerRecentBlocks />
            </div>
          </div>
        </Tab>

        <Tab
          key="blocks"
          title={
            <div className="flex items-center gap-2">
              <Box size={16} />
              <span>Blocks</span>
            </div>
          }
        >
          <ExplorerBlockView />
        </Tab>

        <Tab
          key="transactions"
          title={
            <div className="flex items-center gap-2">
              <ArrowRightLeft size={16} />
              <span>Transactions</span>
            </div>
          }
        >
          <ExplorerTransactionViewer />
        </Tab>

        <Tab
          key="accounts"
          title={
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>Accounts</span>
            </div>
          }
        >
          <ExplorerAccountLookup />
        </Tab>
      </Tabs>
    </div>
  );
}
