'use client';

import React, { } from 'react'
import usePathnameClient from '@/libs/utils/usePathnameClient';
import FeedList from '@/components/comment/FeedList';
import { FeedTypes } from '@/libs/steem/sds';

export default function ProfileFriendsTab() {
    const { username } = usePathnameClient();


    function getEndPoint(feedType: FeedTypes,
        bodyLength = 250,
        limit = 1000,
        offset = 0) {
        const URL = `/feeds_api/get${feedType ??
            'PostsByAuthor'}/${username}/${username}/${bodyLength}/${limit}/${offset}`;
        return URL.trim();
    }


    return (
        <div >
            <div className='flex flex-col space-y-2'>
                <FeedList endPoint={getEndPoint('AccountFriendsFeed')} />
            </div>

        </div>
    )
}
