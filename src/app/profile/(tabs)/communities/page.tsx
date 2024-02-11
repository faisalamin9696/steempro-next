"use client"

import CommunityCard from '@/components/CommunityCard';
// import FeedList from '@/components/comment/FeedList';
import { fetchSds } from '@/libs/constants/AppFunctions';
import usePathnameClient from '@/libs/utils/usePathnameClient';
import { Card } from '@nextui-org/react';
import { useSession } from 'next-auth/react';
import React from 'react'
import useSWR from 'swr';

export default function ProfileCommunitiesTab() {
    const { username } = usePathnameClient();
    const { data: session } = useSession();
    const URL = `/communities_api/getCommunitiesBySubscriber/${username}/${session?.user?.name || 'null'}`;
    const { data } = useSWR(URL, fetchSds<Community[]>);


    // function getEndPoint(feedType: FeedTypes,
    //     bodyLength = 250,
    //     limit = 1000,
    //     offset = 0) {
    //     const URL = `${isDev ? 'test' : ''}/feeds_api/get${feedType ??
    //         'PostsByAuthor'}/${username}/${username}/${bodyLength}/${limit}/${offset}`;
    //     return URL.trim();
    // }

    return (
        <div >
            <div className='flex-col grid md:grid-cols-2 gap-6'>
                {data?.map(community => {
                    return <div className={`grid-footer w-full card card-compact h-full dark:bg-default-900/30 
                    bg-default-900/5 pb-2 flex flex-col overflow-hidden rounded-lg shadow-lg`}>
                        <CommunityCard community={community} />
                    </div>
                })}

                {/* <DynamicFeedList endPoint={getEndPoint('AccountBlog')} /> */}
            </div>

        </div>
    )
}
