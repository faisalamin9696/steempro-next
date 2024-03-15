"use client";

import { Tab, Tabs } from '@nextui-org/react'
import React from 'react'
import usePathnameClient from '@/libs/utils/usePathnameClient';
import FeedPatternSwitch from '@/components/FeedPatternSwitch';
import { useAppSelector } from '@/libs/constants/AppFunctions';
import { getSettings } from '@/libs/utils/user';
import clsx from 'clsx';
import HomeTrendingsTab from './(tabs)/trendings/page';
import HomeCreatedTab from './(tabs)/created/page';
import HomePayoutTab from './(tabs)/payout/page';
import HomeCommunitiesTab from './(tabs)/communities/page';


export default function HomePage({ isLogin }: { isLogin?: boolean }) {
  let { username, category } = usePathnameClient();

  let homeTabs = [
    { title: 'Trendings', key: 'trending', children: <HomeTrendingsTab /> },
    { title: 'New', key: 'created', children: <HomeCreatedTab /> },
    { title: 'Payout', key: 'payout', children: <HomePayoutTab /> },

  ]

  if (isLogin)
    homeTabs.push({ title: 'Communities', key: 'communities', children: <HomeCommunitiesTab /> })


  return (
    <div className={clsx('relative items-center flex-row w-full')}>

      <Tabs
        size='sm'
        disableAnimation
        disableCursorAnimation
        color={'secondary'}
        radius="full"
        className='justify-center'
        defaultSelectedKey={(isLogin && category === 'communities') ? 'communities' : category ?? 'trending'}
        onSelectionChange={(key) => {
          if (!category)
            history.replaceState({}, '', `/${key}`);
          else
            history.pushState({}, '', `/${key}`);
        }}
        classNames={{
          tabList: "max-sm:gap-0 main-tab-list",
          tab: "max-sm:px-2 max-sm:h-5",
          base: ''

        }}

      >
        {homeTabs.map((tab) => <Tab hidden key={tab.key}
          title={tab.title} >
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
