"use client"

import CommunityCard from '@/components/CommunityCard';
// import FeedList from '@/components/comment/FeedList';
import { fetchSds, useAppSelector } from '@/libs/constants/AppFunctions';
import usePathnameClient from '@/libs/utils/usePathnameClient';
import { Button } from '@nextui-org/button';
import clsx from 'clsx';
import Link from 'next/link';
import React from 'react'
import { LuPencilLine } from 'react-icons/lu';
import useSWR from 'swr';

export default function ProfileSubsribtionsTab() {
    const { username } = usePathnameClient();
    const loginInfo = useAppSelector(state => state.loginReducer.value);

    const URL = `/communities_api/getCommunitiesBySubscriber/${username}/${loginInfo.name || 'null'}`;
    const { data } = useSWR(URL, fetchSds<Community[]>);
    const isSelf = !!loginInfo.name && (loginInfo.name === username);


    return (
        <div >
            <div className='flex-col grid md:grid-cols-2 gap-4'>
                {data?.map(community => {
                    return <div key={community.id} className={`grid-footer w-full card card-compact h-full dark:bg-background/90
                    bg-white flex flex-col overflow-hidden rounded-lg shadow-lg`}>
                        <CommunityCard community={community} compact

                            endContent={<div className='flex gap-1 items-center'>
                                {isSelf && <Button size='sm' isIconOnly variant='flat'

                                    title='Create post'
                                    className={clsx('min-w-0  h-6')}
                                    as={Link}
                                    href={{
                                        pathname: `/submit`,
                                        query: {
                                            account: community?.account,
                                            title: community?.title
                                        }
                                    } as any}
                                    color='primary'
                                    radius='full'>
                                    <LuPencilLine className="text-lg" />
                                </Button>}
                                <Button as={Link}
                                    href={`/trending/${community.account}`}
                                    size="sm" color="primary" radius="full"
                                >Explore</Button>

                            </div>
                            }

                        />
                    </div>
                })}

                {/* <DynamicFeedList endPoint={getEndPoint('AccountBlog')} /> */}
            </div>

        </div >
    )
}
