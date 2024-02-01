"use client"

import FeedList from '@/components/comment/FeedList';
import { isDev } from '@/libs/constants/AppConstants';
import { FeedTypes } from '@/libs/steem/sds';
import usePathnameClient from '@/libs/utils/usePathnameClient';
import React from 'react'

export default function CommunityCreatedPage() {
    const { community } = usePathnameClient();


    function getEndPoint(feedType: ValidCategories,
        bodyLength = 250,
        limit = 1000,
        offset = 0) {
        const URL = `/feeds_api/getActiveCommunityPostsBy${feedType}/${community}/${'null'}/${bodyLength}/${limit}/${offset} `;
        return URL.trim();
    }

    return (
        <div >
            <div className='flex flex-col space-y-2'>
                <FeedList endPoint={getEndPoint('created')} />
            </div>

        </div>
    )
}
