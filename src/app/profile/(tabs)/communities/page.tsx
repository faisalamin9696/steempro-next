"use client"

import FeedList from '@/components/comment/FeedList';
import { FeedBodyLength } from '@/libs/constants/AppConstants';
import { useAppSelector } from '@/libs/constants/AppFunctions';
import { FeedTypes } from '@/libs/steem/sds';
import usePathnameClient from '@/libs/utils/usePathnameClient';
import React from 'react'

export default function ProfileCommunitiesTab() {
    const { username } = usePathnameClient();
    const loginInfo = useAppSelector(state => state.loginReducer.value);

    function getEndPoint(feedType: FeedTypes,
        bodyLength = FeedBodyLength,
        limit = 1000,
        offset = 0) {
        const URL = `/feeds_api/get${feedType ?? 'AccountCommunitiesFeedByCreated'}/${username}/${loginInfo.name || 'null'}/${bodyLength}/${limit}/${offset}`;
        return URL.trim();
    }

    return (
        <div >
            <div className='flex flex-col space-y-2'>
                <FeedList className='md:grid-cols-1'
                    endPoint={getEndPoint('AccountCommunitiesFeedByCreated')} />
            </div>

        </div>
    )
}
