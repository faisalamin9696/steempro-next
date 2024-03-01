"use client";

import { Tab, Tabs } from '@nextui-org/react'
import React from 'react'
import usePathnameClient from '@/libs/utils/usePathnameClient';
import  useMobile  from '@/libs/utils/useMobile';
import ProfileBlogsTab from '../(tabs)/blogs/page';
import ProfileWalletTab from '../(tabs)/wallet/page';
import FeedPatternSwitch from '@/components/FeedPatternSwitch';
import { useAppSelector } from '@/libs/constants/AppFunctions';
import { getSettings } from '@/libs/utils/user';
import clsx from 'clsx';
import ProfilePostsMainTab from '../(tabs)/postsMain/page';
import ProfileCommunitiesTab from '../(tabs)/communities/page';

export default function ProfilePage() {
    let { username, category } = usePathnameClient();
    const isMobile = useMobile();
    const settings = useAppSelector(state => state.settingsReducer.value) ?? getSettings();

    const profileTabs = [
        { title: 'Blogs', key: 'blogs', children: <ProfileBlogsTab /> },
        { title: 'Posts', key: 'posts', children: <ProfilePostsMainTab /> },
        { title: 'Communities', key: 'communities', children: <ProfileCommunitiesTab /> },
        { title: 'Wallet', key: 'wallet', children: <ProfileWalletTab /> },
        { title: 'Settings', key: 'settings', children: <ProfileWalletTab /> },


    ]

    return (
        <div className={clsx('relative items-center flex-row w-full')}>
            <Tabs
                size='sm'
                disableAnimation
                disableCursorAnimation
                color={'secondary'}
                radius="full"
                hidden={true}
                className='justify-center transition-all delay-500'
                defaultSelectedKey={['comments', 'replies', 'friends'].includes(category) ? 'posts' : category}
                onSelectionChange={(key) => {
                    history.pushState({}, '', `/@${username}/${key}`);
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
