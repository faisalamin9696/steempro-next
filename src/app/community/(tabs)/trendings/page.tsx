"use client"

import FeedList from '@/components/FeedList';
import { FeedBodyLength } from '@/libs/constants/AppConstants';
import usePathnameClient from '@/libs/utils/usePathnameClient';

export default function CommunityTrendingsTab() {
    const { community } = usePathnameClient();

    function getEndPoint(feedType: ValidCategories,
        bodyLength = FeedBodyLength,
        limit = 1000,
        offset = 0) {
        const URL = `/feeds_api/getActiveCommunityPostsBy${feedType}/${community}/${'null'}/${bodyLength}/${limit}/${offset} `;
        return URL.trim();
    }

    return (
        <div >
            <div className='flex flex-col space-y-2'>
                <FeedList endPoint={getEndPoint('trending')} />
            </div>

        </div>
    )
}
