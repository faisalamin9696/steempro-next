"use client"

import React from 'react'
import usePathnameClient from '@/libs/utils/usePathnameClient';
import FeedList from '@/components/FeedList';
import { FeedTypes } from '@/libs/steem/sds';
import { FeedBodyLength } from '@/libs/constants/AppConstants';

export default function CommunityImportantTab() {
    const { community } = usePathnameClient();


    function getEndPoint(feedType: FeedTypes,
        bodyLength = FeedBodyLength,
        limit = 1000,
        offset = 0) {
        const URL = `/communities_api/getCommunityPinnedPosts/${community}/${'null'}/${bodyLength}`;
        return URL.trim();
    }


    return (
        <div >
            <div className='flex flex-col space-y-2'>
                <FeedList endPoint={getEndPoint('CommunityPinnedPosts')} />
            </div>

        </div>
    )
}
