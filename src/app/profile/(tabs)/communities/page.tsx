"use client"

import CommunityCard from '@/components/CommunityCard';
// import FeedList from '@/components/comment/FeedList';
import { fetchSds, useAppSelector } from '@/libs/constants/AppFunctions';
import usePathnameClient from '@/libs/utils/usePathnameClient';
import { useSession } from 'next-auth/react';
import React from 'react'
import useSWR from 'swr';

export default function ProfileCommunitiesTab() {
    const { username } = usePathnameClient();
    const { data: session } = useSession();
    const loginInfo = useAppSelector(state => state.loginReducer.value);

    const URL = `/communities_api/getCommunitiesBySubscriber/${username}/${loginInfo.name || 'null'}`;
    const { data } = useSWR(URL, fetchSds<Community[]>);


    return (
        <div >
            <div className='flex-col grid md:grid-cols-2 gap-4'>
                {data?.map(community => {
                    return <div key={community.id} className={`grid-footer w-full card card-compact h-full dark:bg-default-900/30 
                    bg-default-900/5 flex flex-col overflow-hidden rounded-lg shadow-lg`}>
                        <CommunityCard community={community} />
                    </div>
                })}

                {/* <DynamicFeedList endPoint={getEndPoint('AccountBlog')} /> */}
            </div>

        </div>
    )
}
