"use client"

import FeedList from '@/components/comment/FeedList';
// import FeedList from '@/components/comment/FeedList';
import { useAppSelector } from '@/libs/constants/AppFunctions';
import { FeedTypes } from '@/libs/steem/sds';
import React from 'react'

export default function HomePayoutTab() {
    const loginInfo = useAppSelector(state => state.loginReducer.value);

    function getEndPoint(feedType: FeedTypes,
        bodyLength = 250,
        limit = 1000,
        offset = 0) {
        const URL = `/feeds_api/get${feedType ??
            'PostsByAuthor'}/${loginInfo.name || 'null'}/${bodyLength}/${limit}/${offset}`;
        return URL.trim();
    }

    return (
        <div >
            <div className='flex flex-col space-y-2'>
                <FeedList className='md:grid-cols-1'
                    endPoint={getEndPoint('ActivePostsByPayout')} />
            </div>

        </div>
    )
}
