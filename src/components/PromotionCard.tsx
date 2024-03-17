'use client';

import { fetchSds, useAppSelector } from '@/libs/constants/AppFunctions';
import React from 'react'
import useSWR from 'swr';
import { getPostThumbnail } from '@/libs/utils/image';
import { useRouter } from 'next13-progressbar';
import { Card } from '@nextui-org/card';
import ViewCountCard from './ViewCountCard';
import Image from 'next/image';
import SAvatar from './SAvatar';
import TimeAgoWrapper from './wrapper/TimeAgoWrapper';
import Link from 'next/link';

interface Props {
    authPerm: string;
}

export default function PromotionCard(props: Props) {
    const { authPerm } = props;
    const [author, permlink] = authPerm.split('/');
    const loginInfo = useAppSelector(state => state.loginReducer.value);

    const URL = `/posts_api/getPost/${authPerm}/${false}/${loginInfo.name || 'null'}`;
    const { data } = useSWR(URL, fetchSds<Post>);

    if (!data)
        return null;

    // const URL = `/posts_api/getPost/${authPerm}`
    // const { data, isLoading, error, isValidating } = useSWR(URL, fetchSds<Post>)

    const thumbnail = getPostThumbnail(data?.json_images);
    const router = useRouter();



    return (
        <div className="card card-compact text-white p-0 rounded-xl overflow-hidden shadow-lg flex flex-col h-[210px]">
            {thumbnail && <Image
                className='bg-blue-800 '
                alt={"image"}
                src={thumbnail}
                height={170}
                width={200}
                style={{
                    objectFit: 'cover',
                    width: '100%',
                    height: '100%'
                }}
            />}
            <div
                className="rounded-lg hover:bg-transparent transition duration-300 absolute bottom-0 top-0 right-0 left-0 bg-gray-900 opacity-25">
            </div>
            <Card as={Link} href={`/${data?.category}/@${data?.author}/${data?.permlink}`}
                shadow='none' radius='none'
                className="text-white text-start p-1 bg-transparent px-2  
                mb-auto absolute bottom-0 self-end left-0 gap-2  ">
                <p
                    className="text-start font-bold 
                    backdrop-blur-sm text-lg line-clamp-1">
                    {data?.title}</p>
                <div className='flex flex-row items-center gap-2 text-tiny'>
                    <SAvatar size='xs' username={author} />
                    <p>@{author} ● </p>

                    <TimeAgoWrapper created={data.created * 1000} />
                </div>

            </Card>

            <div className='absolute right-0 m-2 '>
                <ViewCountCard comment={data} compact />

            </div>

        </div>
    )
}
