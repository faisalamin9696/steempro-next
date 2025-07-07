"use client";

import { Tab, Tabs } from "@heroui/tabs";
import { useState } from "react";
import { useDeviceInfo } from "@/hooks/useDeviceInfo";
import BalanceTab from "./BalanceTab";
import DelegationTab from "./DelegationTab";
import TransferHistoryTab from "./TransferHistoryTab";
import PendingRewards from "@/components/PendingRewards";
import PowerDownStatus from "@/components/PowerDownStatus";

export default function WalletTab({ data }: { data: AccountExt }) {
  const [selectedTab, setSelectedTab] = useState("balance");
  const { isMobile } = useDeviceInfo();

  return (
    <div className=" flex flex-col gap-2">
      <PendingRewards account={data} />
      <PowerDownStatus account={data} />

      <Tabs
        destroyInactiveTabPanel={false}
        aria-label="Wallet"
        color={"secondary"}
        size="sm"
        disableAnimation={isMobile}
        variant={"underlined"}
        radius={isMobile ? "full" : "sm"}
        onSelectionChange={(key) => {
          setSelectedTab(key as string);
        }}
        selectedKey={selectedTab}
      >
        <Tab key="balance" title="Balance">
          <BalanceTab
            data={data}
            onDelegationClick={() => {
              setSelectedTab("delegation");
            }}
          />
        </Tab>

        <Tab key="delegation" title="Delegation">
          <DelegationTab data={data} />
        </Tab>

        <Tab key="history" title="History">
          <TransferHistoryTab data={data} />
        </Tab>
      </Tabs>
    </div>
  );
}
