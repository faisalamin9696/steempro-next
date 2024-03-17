'use client';

import CommentCover from '@/components/comment/component/CommentCover'
import { Card } from "@nextui-org/card";
import React, { memo } from 'react'
import { getPostThumbnail } from '@/libs/utils/image'
import BodyShort from '@/components/body/BodyShort'
import { readingTime } from '@/libs/utils/readingTime/reading-time-estimator'
import ViewCountCard from './ViewCountCard'
import { useAppSelector } from '@/libs/constants/AppFunctions'
import Link from 'next/link';


interface Props {
    comment: Feed;
}

export default memo(function CompactPost(props: Props) {
    const { comment } = props;
    const commentInfo = useAppSelector(state => state.commentReducer.values)[`${comment.author}/${comment.permlink}`] ?? comment;

    // const URL = `/posts_api/getPost/${authPerm}`
    // const { data, isLoading, error, isValidating } = useSWR(URL, fetchSds<Post>)
    const thumbnail = getPostThumbnail(commentInfo?.json_images);




    return (
        <div className="card card-compact rounded-lg overflow-hidden shadow-lg flex flex-col bg-white dark:bg-white/5">
            <div className="relative">


                <CommentCover className='max-h-40' thumbnail src={thumbnail} />

                <div
                    className="rounded-lg hover:bg-transparent transition duration-300 absolute bottom-0 top-0 right-0 left-0 bg-gray-900 opacity-25">
                </div>
                {/* 
    <Link href={`/trending/${'hive-144064'}`}
      className="border rounded-full text-tiny absolute top-0 right-0
         px-2 py-1 m-3
          backdrop-blur-lg">
      Beauty of Creativity
    </Link> */}
            </div>
            <Card as={Link}
                href={`/${commentInfo.category}/@${commentInfo.author}/${commentInfo.permlink}`}
                shadow='none' radius='none' className=" text-start p-0 bg-transparent px-2 py-2 mb-auto">
                <p
                    className="font-medium text-md mb-2">
                    {commentInfo?.title}</p>
                <p className="text-default-900/50 text-tiny line-clamp-2">
                    <BodyShort body={commentInfo?.body} />
                </p>
            </Card>
            <div className="px-2 py-2 flex flex-row items-center justify-between">
                <span className="py-1 text-xs font-regular  mr-1 flex flex-row items-center">

                    <span className="ml-1 text-default-900/80">{readingTime('', commentInfo?.word_count).text}</span>
                </span>

                <div className=' flex items-center gap-2'>

                    <ViewCountCard comment={commentInfo} className='text-tiny font-light' />

                    <span className="py-1 text-xs font-regular gap-1 text-default-900/80 mr-1 flex flex-row items-center">
                        <svg className="h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z">
                            </path>
                        </svg>
                        {commentInfo?.children && <div className="flex text-default-900/80 gap-1">{commentInfo?.children}</div>}
                    </span>
                </div>

            </div>
        </div>
    )
}
)