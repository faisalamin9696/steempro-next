"use client"

import FeedList from '@/components/comment/FeedList';
import { isDev } from '@/libs/constants/AppConstants';
import { FeedTypes } from '@/libs/steem/sds';
import { useSession } from 'next-auth/react';
import React from 'react'

export default function HomeTrendingsTab() {
    const { data: session } = useSession();

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
                <FeedList className='grid grid-cols-1 gap-6 1md:grid-cols-2 xl:grid-cols-3'
                    endPoint={getEndPoint('ActivePostsByTrending')} />
            </div>

        </div>
    )
}
