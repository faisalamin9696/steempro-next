"use client";

import { Tab, Tabs } from '@nextui-org/react'
import React from 'react'
import usePathnameClient from '@/libs/utils/usePathnameClient';
import ProfileBlogsTab from '../(tabs)/blogs/page';
import ProfileWalletTab from '../(tabs)/wallet/page';
import FeedPatternSwitch from '@/components/FeedPatternSwitch';
import { useAppSelector } from '@/libs/constants/AppFunctions';
import { getSettings } from '@/libs/utils/user';
import clsx from 'clsx';
import ProfilePostsMainTab from '../(tabs)/postsMain/page';
import ProfileCommunitiesTab from '../(tabs)/communities/page';
import ProfileSettingsTab from '../(tabs)/settings/page';

export default function ProfilePage() {
    let { username, category } = usePathnameClient();
    const settings = useAppSelector(state => state.settingsReducer.value) ?? getSettings();
    const loginInfo = useAppSelector(state => state.loginReducer.value);

    const isSelf = username === loginInfo.name;
    const profileTabs = [
        { title: 'Blogs', key: 'blogs', children: <ProfileBlogsTab /> },
        { title: 'Posts', key: 'posts', children: <ProfilePostsMainTab /> },
        { title: 'Communities', key: 'communities', children: <ProfileCommunitiesTab /> },
        { title: 'Wallet', key: 'wallet', children: <ProfileWalletTab /> },
    ];

    if (isSelf)
        profileTabs.push({ title: 'Settings', key: 'settings', children: <ProfileSettingsTab /> })



    return (
        <div className={clsx('relative items-center flex-row w-full')}>
            <Tabs
                size='sm'
                disableAnimation
                disableCursorAnimation
                color={'secondary'}
                radius="full"
                hidden={true}
                selectedKey={['comments', 'replies', 'friends'].includes(category) ? 'posts' : category}
                className='justify-center transition-all delay-500'
                defaultSelectedKey={['comments', 'replies', 'friends'].includes(category) ? 'posts' : category}
                onSelectionChange={(key) => {
                    if (!category)
                        history.replaceState({}, '', `/@${username}/${key}`);
                    else
                        history.pushState({}, '', `/@${username}/${key}`);
                }}
                classNames={{
                    tabList: "max-sm:gap-0 main-tab-list",
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
