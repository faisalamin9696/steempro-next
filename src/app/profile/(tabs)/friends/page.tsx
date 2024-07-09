'use client';

import React, { } from 'react'
import usePathnameClient from '@/libs/utils/usePathnameClient';
import FeedList from '@/components/FeedList';
import { getEndPoint, useAppSelector } from '@/libs/constants/AppFunctions';

export default function ProfileFriendsTab() {
    const { username } = usePathnameClient();
    const loginInfo = useAppSelector(state => state.loginReducer.value);

    return (
        <div >
            <div className='flex flex-col space-y-2'>
                <FeedList endPoint={getEndPoint('AccountFriendsFeed',`${username}/${loginInfo.name || 'null'}`)} />
            </div>

        </div>
    )
}
