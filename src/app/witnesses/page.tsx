"use client";

import { useAppSelector } from "@/constants/AppFunctions";
import React from "react";
import { Tab, Tabs } from "@heroui/tabs";
import { useWitnessData } from "@/hooks/useWitnesses";
import { FaUsers } from "react-icons/fa";
import { FiSettings } from "react-icons/fi";
import WitnessListTab from "./(tabs)/WitnessListTab";
import WitnessProxyTab from "./(tabs)/WitnessProxyTab";
import { SiTraefikproxy } from "react-icons/si";
import MyWitnessTab from "./(tabs)/MyWitnessTab";

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

  return (
    <div className="flex flex-col gap-4 p-2">
      <div className="flex flex-col items-center sm:items-start gap-2 text-center">
        <p className="text-xl font-bold sm:text-3xl">
          Steem Witnesses (aka "Block Producers")
        </p>
        <p className="text-sm text-default-500">
          Trusted witnesses keep the Steem blockchain secure and operational by producing blocks
        </p>
      </div>

      <Tabs destroyInactiveTabPanel={false}>
        <Tab
          title={
            <div className="flex flex-row gap-2 items-center">
              <FaUsers size={18} />
              <p>Witnesses</p>
            </div>
          }
        >
          <WitnessListTab data={{ ...data }} />
        </Tab>

        <Tab
          title={
            <div className="flex flex-row gap-2 items-center">
              <SiTraefikproxy size={18} />
              <p>Proxy</p>
            </div>
          }
        >
          <WitnessProxyTab data={{ ...data }} />
        </Tab>

        {data.ownWitness && (
          <Tab
            isDisabled={!data.ownWitness}
            title={
              <div className="flex flex-row gap-2 items-center">
                <FiSettings size={18} />
                <p>My Witness</p>
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
