"use client";

import { Tab, Tabs } from '@nextui-org/react'
import React from 'react'
import usePathnameClient from '@/libs/utils/usePathnameClient';
import { useMobile } from '@/libs/utils/useMobile';
import ProfileFriendsTab from '../(tabs)/friends/page';
import ProfileBlogsTab from '../(tabs)/blogs/page';
import ProfilePostsTab from '../(tabs)/posts/page';
import ProfileCommentsTab from '../(tabs)/comments/page';
import ProfileRepliesTab from '../(tabs)/replies/page';
import ProfileWalletTab from '../(tabs)/wallet/page';
import FeedPatternSwitch from '@/components/FeedPatternSwitch';
import { useAppSelector } from '@/libs/constants/AppFunctions';
import { getSettings } from '@/libs/utils/user';
import clsx from 'clsx';

export default function ProfilePage() {
    let { username, category } = usePathnameClient();
    const isMobile = useMobile();
    const settings = useAppSelector(state => state.settingsReducer.value) ?? getSettings();

    const profileTabs = [
        { title: 'Blogs', key: 'blogs', children: <ProfileBlogsTab /> },
        { title: 'Friends', key: 'friends', children: <ProfileFriendsTab /> },
        { title: 'Posts', key: 'posts', children: <ProfilePostsTab /> },
        { title: 'Comments', key: 'comments', children: <ProfileCommentsTab /> },
        { title: 'Replies', key: 'replies', children: <ProfileRepliesTab /> },
        { title: 'Wallet', key: 'wallet', children: <ProfileWalletTab /> },

    ]

    return (
        <div className={clsx('relative items-center flex-row w-full')}>
            <Tabs
                size='sm'
                disableAnimation
                disableCursorAnimation
                fullWidth={isMobile}
                color={'secondary'} radius="full"
                className='justify-center transition-all delay-500'
                defaultSelectedKey={category ?? 'friends'}
                onSelectionChange={(key) => {
                    history.pushState({}, '', `/@${username}/${key}`);
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

            {category !== 'wallet' &&
                <div className='absolute  top-0 right-0 max-sm:hidden'>
                    <FeedPatternSwitch />
                </div>}
        </div>
    )
}
