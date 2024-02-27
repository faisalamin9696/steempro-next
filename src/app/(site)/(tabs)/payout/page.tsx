"use client"

import FeedList from '@/components/comment/FeedList';
// import FeedList from '@/components/comment/FeedList';
import { isDev } from '@/libs/constants/AppConstants';
import { FeedTypes } from '@/libs/steem/sds';
import usePathnameClient from '@/libs/utils/usePathnameClient';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import React from 'react'

export default function HomePayoutTab() {
    const { data: session } = useSession();
    const { username } = usePathnameClient();


    function getEndPoint(feedType: FeedTypes,
        bodyLength = 250,
        limit = 1000,
        offset = 0) {
        const URL = `${isDev ? 'test' : ''}/feeds_api/get${feedType ??
            'PostsByAuthor'}/${session?.user?.name ?? 'null'}/${bodyLength}/${limit}/${offset}`;
        return URL.trim();
    }

    return (
        <div >
            <div className='flex flex-col space-y-2'>
                <FeedList gridClassName='md:grid-cols-1'
                    endPoint={getEndPoint('ActivePostsByPayout')} />
            </div>

        </div>
    )
}
