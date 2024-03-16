'use client';

import React, { } from 'react'
import usePathnameClient from '@/libs/utils/usePathnameClient';
import FeedList from '@/components/comment/FeedList';
import { FeedTypes } from '@/libs/steem/sds';
import { useAppSelector } from '@/libs/constants/AppFunctions';

export default function ProfileFriendsTab() {
    const { username } = usePathnameClient();
    const loginInfo = useAppSelector(state => state.loginReducer.value);



    function getEndPoint(feedType: FeedTypes,
        bodyLength = 250,
        limit = 1000,
        offset = 0) {
        const URL = `/feeds_api/get${feedType ??
            'PostsByAuthor'}/${username}/${loginInfo.name || 'null'}/${bodyLength}/${limit}/${offset}`;
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
