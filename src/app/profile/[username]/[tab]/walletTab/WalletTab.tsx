"use client";

import { Tab, Tabs } from "@heroui/tabs";
import { useState } from "react";
import { useDeviceInfo } from "@/hooks/useDeviceInfo";
import BalanceTab from "./BalanceTab";
import DelegationTab from "./DelegationTab";
import TransferHistoryTab from "./TransferHistoryTab";
import PendingRewards from "@/components/PendingRewards";
import PowerDownStatus from "@/components/PowerDownStatus";
import AccountRecoveryStatus from "@/components/AccountRecoveryStatus";
import { useAppSelector } from "@/constants/AppFunctions";

export default function WalletTab({ data }: { data: AccountExt }) {
  const [selectedTab, setSelectedTab] = useState("balance");
  const { isMobile } = useDeviceInfo();
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const isSelf = data.name === loginInfo.name;

  return (
    <div className=" flex flex-col gap-2">
      <AccountRecoveryStatus account={isSelf ? loginInfo : data} />
      <PendingRewards account={isSelf ? loginInfo : data} />
      <PowerDownStatus account={isSelf ? loginInfo : data} />

      <Tabs
        destroyInactiveTabPanel={false}
        aria-label="Wallet"
        color={"secondary"}
        size="sm"
        variant={"underlined"}
        radius={isMobile ? "full" : "sm"}
        onSelectionChange={(key) => {
          setSelectedTab(key as string);
        }}
        selectedKey={selectedTab}
      >
        <Tab key="balance" title="Balance">
          <BalanceTab
            data={isSelf ? loginInfo : data}
            onDelegationClick={() => {
              setSelectedTab("delegation");
            }}
          />
        </Tab>

        <Tab key="delegation" title="Delegation">
          <DelegationTab data={isSelf ? loginInfo : data} />
        </Tab>

        <Tab key="history" title="History">
          <TransferHistoryTab data={isSelf ? loginInfo : data} />
        </Tab>
      </Tabs>
    </div>
  );
}
