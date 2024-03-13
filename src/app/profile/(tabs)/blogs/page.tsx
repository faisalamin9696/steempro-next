"use client"

import FeedList from '@/components/comment/FeedList';
import { isDev } from '@/libs/constants/AppConstants';
import { FeedTypes } from '@/libs/steem/sds';
import usePathnameClient from '@/libs/utils/usePathnameClient';
import React from 'react'

export default function ProfileBlogsTab() {
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
                <FeedList endPoint={getEndPoint('AccountBlog')} />
            </div>

        </div>
    )
}
