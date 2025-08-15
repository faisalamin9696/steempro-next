"use client";

import { useAppSelector } from "@/constants/AppFunctions";
import React, { useState } from "react";
import { Tab, Tabs } from "@heroui/tabs";
import { useTranslation } from "@/utils/i18n";
import { useWitnessData } from "@/hooks/useWitnesses";
import { FaUsers } from "react-icons/fa";
import { FiSettings } from "react-icons/fi";
import WitnessProxyTab from "./(tabs)/WitnessProxyTab";
import { SiTraefikproxy } from "react-icons/si";
import MyWitnessTab from "./(tabs)/MyWitnessTab";
import WitnessListTab from "./(tabs)/WitnessListTab";

export interface WitnessDataProps {
  witnesses: MergedWitness[];
  isLoading: boolean;
  error: Error | null;
  userVoteCount: number;
  userData: AccountExt | null | undefined;
}

export default function WitnessPage() {
  const loginInfo = useAppSelector((state) => state.loginReducer.value);
  const data = useWitnessData(loginInfo);
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<
    "witnesses" | "proxy" | "mywitness"
  >("witnesses");

  return (
    <div className="flex flex-col gap-4 p-2">
      <div className="flex flex-col items-center sm:items-start gap-2 text-center">
        <p className="text-xl font-bold sm:text-3xl">
          {t("witnesses.page_title")}
        </p>
        <p className="text-sm text-default-500 text-center sm:text-start">
          {t("witnesses.page_description")}
        </p>
      </div>

      <Tabs
        destroyInactiveTabPanel={false}
        selectedKey={activeTab}
        onSelectionChange={(key) => setActiveTab(key.toString() as any)}
      >
        <Tab
          key={"witnesses"}
          title={
            <div className="flex flex-row gap-2 items-center">
              <FaUsers size={18} />
              <p>{t("sidebar.witnesses")}</p>
            </div>
          }
        >
          <WitnessListTab
            data={{ ...data }}
            handleManageProxy={() => {
              setActiveTab("proxy");
            }}
          />
        </Tab>

        <Tab
          key={"proxy"}
          title={
            <div className="flex flex-row gap-2 items-center">
              <SiTraefikproxy size={18} />
              <p>{t("witnesses.proxy_tab")}</p>
            </div>
          }
        >
          <WitnessProxyTab data={{ ...data }} />
        </Tab>

        {data.ownWitness && (
          <Tab
            key={"mywitness"}
            isDisabled={!data.ownWitness}
            title={
              <div className="flex flex-row gap-2 items-center">
                <FiSettings size={18} />
                <p>{t("witnesses.my_witness_tab")}</p>
              </div>
            }
          >
            <MyWitnessTab witness={data.ownWitness} />
          </Tab>
        )}
      </Tabs>
    </div>
  );
}
