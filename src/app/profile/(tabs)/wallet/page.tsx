"use client";

import { Tab, Tabs } from '@nextui-org/react'
import BalanceTab from './(tabs)/BalanceTab';
import DelegationTab from './(tabs)/DelegationTab';



export default function ProfileWalletTab() {


  return (
    <Tabs aria-label="Options" variant='underlined' size='sm'>
      <Tab key="balance" title="Balance">
        <BalanceTab />
      </Tab>

      <Tab key="delegation" title="Delegation">
        <DelegationTab />
      </Tab>

    </Tabs>
  )
}
