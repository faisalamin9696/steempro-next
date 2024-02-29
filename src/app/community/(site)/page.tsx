"use client";

import { Tab, Tabs } from '@nextui-org/react'
import React from 'react'
import usePathnameClient from '@/libs/utils/usePathnameClient';
import useMobile  from '@/libs/utils/useMobile';
import FeedPatternSwitch from '@/components/FeedPatternSwitch';
import CommunityImportantTab from '../(tabs)/important/page';
import CommunityTrendingsTab from '../(tabs)/trendings/page';
import CommunityCreatedPage from '../(tabs)/created/page';
import CommunityAboutTab from '../(tabs)/about/page';

export default function CommunityPage() {
    let { community, category } = usePathnameClient();
    const isMobile = useMobile();

    const profileTabs = [
        { title: 'Important', key: 'important', children: <CommunityImportantTab /> },
        { title: 'Trending', key: 'trending', children: <CommunityTrendingsTab /> },
        { title: 'New', key: 'created', children: <CommunityCreatedPage /> },
        { title: 'About', key: 'about', children: <CommunityAboutTab /> },

    ]

    return (
        <div className='relative items-center flex-row w-full'>
            <Tabs
                size='sm'
                disableAnimation
                disableCursorAnimation
                color={'secondary'} radius="full"
                className='justify-center transition-all delay-500'
                defaultSelectedKey={category ?? 'trendings'}
                onSelectionChange={(key) => {
                    history.pushState({}, '', `/${key}/${community}`);
                }}
                classNames={{
                    tabList: "max-sm:gap-0 bg-default-300",
                    tab: "max-sm:max-w-prose max-sm:px-2 max-sm:h-5",
                }}

            >
                {profileTabs.map((tab) => <Tab key={tab.key}
                    title={tab.title}
                >
                    {tab.children}
                </Tab>)}
            </Tabs>

            {category !== 'about' &&
                <div className='absolute  top-0 right-0 max-sm:hidden'>
                    <FeedPatternSwitch />
                </div>}
        </div>
    )
}
