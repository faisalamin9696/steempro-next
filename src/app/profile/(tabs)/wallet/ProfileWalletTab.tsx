"use client";

import { Tab, Tabs } from '@nextui-org/react'
import BalanceTab from './(tabs)/BalanceTab';
import DelegationTab from './(tabs)/DelegationTab';



export default function ProfileWalletTab({ data }: { data: AccountExt }) {


  return (
    <Tabs aria-label="Options" variant='underlined' size='sm'>
      <Tab key="balance" title="Balance">
        <BalanceTab data={data} />
      </Tab>

      <Tab key="delegation" title="Delegation">
        <DelegationTab data={data} />
      </Tab>

    </Tabs>
  )
}
