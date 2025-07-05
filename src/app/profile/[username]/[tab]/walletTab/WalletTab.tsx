"use client";

import { Tab, Tabs } from "@heroui/tabs";
import { Button } from "@heroui/button";
import { vestToSteem } from "@/utils/helper/vesting";
import { useAppDispatch, useAppSelector } from "@/constants/AppFunctions";
import { useMutation } from "@tanstack/react-query";
import { claimRewardBalance } from "@/libs/steem/condenser";
import { toast } from "sonner";
import { saveLoginHandler } from "@/hooks/redux/reducers/LoginReducer";
import { useLogin } from "@/components/auth/AuthProvider";
import { getCredentials, getSessionKey } from "@/utils/user";
import { FaArrowAltCircleDown } from "react-icons/fa";
import { useSession } from "next-auth/react";
import { useState } from "react";
import TimeAgoWrapper from "@/components/wrappers/TimeAgoWrapper";
import PowerDownModal from "@/components/PowerDownModal";
import { useDeviceInfo } from "@/hooks/useDeviceInfo";
import BalanceTab from "./BalanceTab";
import DelegationTab from "./DelegationTab";
import TransferHistoryTab from "./TransferHistoryTab";
import PendingRewards from "@/components/PendingRewards";
import PowerDownStatus from "@/components/PowerDownStatus";

export default function WalletTab({ data }: { data: AccountExt }) {
  const { data: session } = useSession();
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const globalData = useAppSelector((state) => state.steemGlobalsReducer.value);
  const dispatch = useAppDispatch();
  const isSelf = session?.user?.name === data.name;
  const { authenticateUser, isAuthorized } = useLogin();
  const [selectedTab, setSelectedTab] = useState("balance");

  const { isMobile } = useDeviceInfo();

  return (
    <div className=" flex flex-col gap-2">
      <PendingRewards account={data} />
      <PowerDownStatus account={data} />

      {/* {!!data.powerdown && (
        <div className="flex flex-col gap-2 items-center mt-4">
          <div className="flex gap-2 items-center">
            <FaArrowAltCircleDown
              className="text-red-400 text-medium"
              title="Power down"
            />
            <p className="text-sm">
              {vestToSteem(
                data.powerdown_done,
                globalData.steem_per_share
              )?.toLocaleString()}
              /
              {vestToSteem(
                data.powerdown,
                globalData.steem_per_share
              )?.toLocaleString()}{" "}
              STEEM
            </p>
          </div>
          <div className="text-tiny flex items-center gap-1">
            <p>Next power down</p>
            <TimeAgoWrapper created={data.next_powerdown * 1000} />: ~
            {vestToSteem(
              data.powerdown_rate,
              globalData.steem_per_share
            )?.toLocaleString()}{" "}
            STEEM
          </div>
          {!!data.powerdown && isSelf && (
            <Button
              size="sm"
              onPress={() => {
                setPowerDownModal({ isOpen: true, cancel: true });
              }}
            >
              Cancel Power Down
            </Button>
          )}
        </div>
      )} */}

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
