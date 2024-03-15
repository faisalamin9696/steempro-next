"use client";

import { Tab, Tabs } from '@nextui-org/react'
import React, { useEffect } from 'react'
import usePathnameClient from '@/libs/utils/usePathnameClient';
import ProfileBlogsTab from '../(tabs)/blogs/page';
import ProfileWalletTab from '../(tabs)/wallet/page';
import FeedPatternSwitch from '@/components/FeedPatternSwitch';
import { useAppDispatch, useAppSelector } from '@/libs/constants/AppFunctions';
import clsx from 'clsx';
import ProfilePostsMainTab from '../(tabs)/postsMain/page';
import ProfileCommunitiesTab from '../(tabs)/communities/page';
import ProfileSettingsTab from '../(tabs)/settings/page';
import { saveLoginHandler } from '@/libs/redux/reducers/LoginReducer';
import { addProfileHandler } from '@/libs/redux/reducers/ProfileReducer';

export default function ProfilePage({ data }: { data: AccountExt }) {
    let { username, category } = usePathnameClient();



    const loginInfo = useAppSelector(state => state.loginReducer.value);
    const profileInfo = useAppSelector(state => state.profileReducer.value)[data?.name] ?? data;

    const isSelf = loginInfo.name === username;
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (data)
            if (isSelf)
                dispatch(saveLoginHandler(data));
            else dispatch(addProfileHandler(data));

    }, [data]);


    const profileTabs = [
        { title: 'Blogs', key: 'blogs', children: <ProfileBlogsTab /> },
        { title: 'Posts', key: 'posts', children: <ProfilePostsMainTab /> },
        { title: 'Communities', key: 'communities', children: <ProfileCommunitiesTab /> },
        { title: 'Wallet', key: 'wallet', children: <ProfileWalletTab data={isSelf? loginInfo: profileInfo} /> },
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

            {category !== 'wallet' &&
                <div className='absolute  top-0 right-0 max-sm:hidden'>
                    <FeedPatternSwitch />
                </div>}


        </div>
    )
}
