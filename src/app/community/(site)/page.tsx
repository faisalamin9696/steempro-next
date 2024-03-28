"use client";

import { Tab, Tabs } from '@nextui-org/tabs'
import React from 'react'
import usePathnameClient from '@/libs/utils/usePathnameClient';
import FeedPatternSwitch from '@/components/FeedPatternSwitch';
import CommunityImportantTab from '../(tabs)/important/page';
import CommunityTrendingsTab from '../(tabs)/trendings/page';
import CommunityCreatedPage from '../(tabs)/created/page';
import { useDeviceInfo } from '@/libs/utils/useDeviceInfo';
import { CommunityAboutContent } from '../../../components/community/CommunityAboutCard';

interface Props {
    data: Community;

}

export default function CommunityPage(props: Props) {
    const { data } = props;
    let { community, category } = usePathnameClient();
    const { isMobile } = useDeviceInfo();


    const profileTabs = [
        { title: 'Important', key: 'important', children: <CommunityImportantTab /> },
        { title: 'Trending', key: 'trending', children: <CommunityTrendingsTab /> },
        { title: 'New', key: 'created', children: <CommunityCreatedPage /> },
        { title: 'About', key: 'about', children: <CommunityAboutContent community={data} /> },

    ]

    return (
        <div className='relative items-center flex-row w-full'>
            <Tabs
                size='sm'
                disableAnimation
                disableCursorAnimation
                color={'secondary'} radius="full"
                className='justify-center'
                defaultSelectedKey={category ?? 'trendings'}
                onSelectionChange={(key) => {
                    if (!category)
                        history.replaceState({}, '', `/${key}/${community}`);
                    else
                        history.pushState({}, '', `/${key}/${community}`);
                }}
                classNames={{
                    tabList: "max-sm:gap-0 main-tab-list",
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
