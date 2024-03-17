"use client"

import FeedList from '@/components/comment/FeedList';
import { useAppSelector } from '@/libs/constants/AppFunctions';
import { FeedTypes } from '@/libs/steem/sds';
import usePathnameClient from '@/libs/utils/usePathnameClient';
import React from 'react'

export default function CategoryTrendingsTab() {
    const { tag } = usePathnameClient();
    const loginInfo = useAppSelector(state => state.loginReducer.value);

    function getEndPoint(feedType: FeedTypes,
        bodyLength = 250,
        limit = 1000,
        offset = 0) {
        const URL = `/feeds_api/getActivePostsByTagTrending/${tag}/${loginInfo.name || 'null'}/${bodyLength}/${limit}/${offset}`;
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
