"use client";

import { Tab, Tabs } from '@nextui-org/react'
import React from 'react'
import usePathnameClient from '@/libs/utils/usePathnameClient';
import { useMobile } from '@/libs/utils/useMobile';
import FeedPatternSwitch from '@/components/FeedPatternSwitch';
import { useAppSelector } from '@/libs/constants/AppFunctions';
import { getSettings } from '@/libs/utils/user';
import clsx from 'clsx';
import HomeTrendingsTab from './(tabs)/trendings/page';
import HomeCreatedTab from './(tabs)/created/page';
import HomePayoutTab from './(tabs)/payout/page';


export default function HomePage() {
  let { username, category } = usePathnameClient();
  const isMobile = useMobile();
  const settings = useAppSelector(state => state.settingsReducer.value) ?? getSettings();

  const profileTabs = [
    { title: 'Trendings', key: 'trending', children: <HomeTrendingsTab /> },
    { title: 'New', key: 'created', children: <HomeCreatedTab /> },
    { title: 'Payout', key: 'payout', children: <HomePayoutTab /> },

  ]

  return (
    <div className={clsx('relative items-center flex-row w-full')}>
      <Tabs
        size='sm'
        disableAnimation
        disableCursorAnimation
        fullWidth={isMobile}
        color={'secondary'}
        radius="full"
        hidden={true}
        className='justify-center transition-all delay-500'
        defaultSelectedKey={category ?? 'trending'}
        onSelectionChange={(key) => {
          history.pushState({}, '', `/${key}`);
        }}
        classNames={{
          tabList: "max-sm:gap-0 bg-default-300",
          tab: "max-sm:max-w-prose max-sm:px-2 max-sm:h-5",
        }}

      >
        {profileTabs.map((tab) => <Tab hidden key={tab.key}
          title={tab.title}
        >
          {tab.children}
        </Tab>)}
      </Tabs>

      {category !== 'wallet' &&
        <div className='absolute  top-0 right-0 max-sm:hidden'>
          <FeedPatternSwitch />
        </div>}
    </div>
  )
}
