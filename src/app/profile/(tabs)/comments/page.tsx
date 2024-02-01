"use client"

import { isDev } from '@/libs/constants/AppConstants';
import { FeedTypes } from '@/libs/steem/sds';
import usePathnameClient from '@/libs/utils/usePathnameClient';
import dynamic from 'next/dynamic';
import React from 'react'

const DynamicFeedList = dynamic(() => import('@/components/comment/FeedList'));

export default function ProfileCommentsTab() {
    const { username } = usePathnameClient();


    function getEndPoint(feedType: FeedTypes,
        bodyLength = 250,
        limit = 1000,
        offset = 0) {
        const URL = `${isDev ? 'test' : ''}/feeds_api/get${feedType ??
            'PostsByAuthor'}/${username}/${username}/${bodyLength}/${limit}/${offset}`;
        return URL.trim();
    }

    return (
        <div >
            <div className='flex flex-col space-y-2'>
                <DynamicFeedList endPoint={getEndPoint('CommentsByAuthor')} />
            </div>

        </div>
    )
}
