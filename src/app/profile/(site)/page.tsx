"use client";

import { Tab, Tabs } from '@nextui-org/tabs';
import React, { useEffect } from 'react';
import usePathnameClient from '@/libs/utils/usePathnameClient';
import ProfileBlogsTab from '../(tabs)/blog/page';
import ProfileWalletTab from '../(tabs)/wallet/ProfileWalletTab';
import FeedPatternSwitch from '@/components/FeedPatternSwitch';
import { useAppDispatch, useAppSelector } from '@/libs/constants/AppFunctions';
import clsx from 'clsx';
import ProfilePostsMainTab from '../(tabs)/postsMain/page';
import ProfileSettingsTab from '../(tabs)/settings/page';
import { saveLoginHandler } from '@/libs/redux/reducers/LoginReducer';
import { addProfileHandler } from '@/libs/redux/reducers/ProfileReducer';
import { useRouter } from 'next13-progressbar';
import { usePathname } from 'next/navigation';
import ProfileCommunitiesMainTab from '../(tabs)/CommunitiesMain/page';

export default function ProfilePage({ data }: { data: AccountExt }) {
    let { username, category } = usePathnameClient();

    const loginInfo = useAppSelector(state => state.loginReducer.value);
    const profileInfo = useAppSelector(state => state.profileReducer.value)[data?.name] ?? data;
    const router = useRouter();
    const pathname = usePathname();

    const isSelf = !!loginInfo.name && (loginInfo.name === (username));
    const dispatch = useAppDispatch();


    useEffect(() => {
        router.refresh();
    }, [pathname]);


    useEffect(() => {
        if (data)
            if (isSelf)
                dispatch(saveLoginHandler({ ...data, unread_count: loginInfo.unread_count }));
            else dispatch(addProfileHandler(data));

    }, [data]);


    const profileTabs = [
        { title: 'Blog', key: 'blog', children: <ProfileBlogsTab /> },
        { title: 'Posts', key: 'posts', children: <ProfilePostsMainTab /> },
        { title: 'Communities', key: 'communities', children: <ProfileCommunitiesMainTab /> },
        { title: 'Wallet', key: 'wallet', children: <ProfileWalletTab data={isSelf ? loginInfo : profileInfo} /> },
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
                className='justify-center'
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

            {!(['wallet', 'settings'].includes(category)) &&
                <div className='absolute  top-0 right-0 max-sm:hidden'>
                    <FeedPatternSwitch />
                </div>}


        </div>
    )
}
