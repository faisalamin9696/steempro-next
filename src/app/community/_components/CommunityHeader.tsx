'use client';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import Image from 'next/image';
import { useAppDispatch } from '@/libs/constants/AppFunctions';
import { addProfileHandler } from '@/libs/redux/reducers/ProfileReducer';
import SAvatar from '@/components/SAvatar';
import usePathnameClient from '@/libs/utils/usePathnameClient';
import UserCoverCard from '@/components/UserCoverCard';

interface Props {
    data: Community;

}
export default function CommunityHeader(props: Props) {
    const { data } = props;
    const { community } = usePathnameClient();
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (data) {
            dispatch(addProfileHandler(data));

        }

    }, []);



    return (<div className='w-full p-1 relative '>
        <div className='card flex items-center w-full relative '>

            <UserCoverCard src={'/steempro-cover.png'} />
            <div className="stats bg-default-100/50 dark:bg-default-400/50  backdrop-blur-md shadow m-auto max-w-6xl sm:max-w-4xl top-5 absolute mx-2 max-sm:w-11/12 max-[720px]:flex max-[720px]:flex-col"
            >
                <div className='flex'>
                    <div className="stat ">
                        <div className="stat-figure text-default-900">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <div className="stat-title text-white">{'Rank'}</div>
                        <div className="stat-value text-default-900">{data?.rank}</div>
                        <div className="stat-desc"></div>
                    </div>

                    <div className="stat">
                        <div className="stat-figure text-secondary">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                className="inline-block w-8 h-8 stroke-current">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div className="stat-title text-white">{'Subscribers'}</div>
                        <div className="stat-value text-secondary">{data?.count_subs}</div>
                        <div className="stat-desc"></div>
                    </div>
                </div>

                <div className="stat">
                    <div className="stat-figure text-secondary">
                        <SAvatar {...props} username={community} xl size={'lg'} quality='medium' sizeNumber={60}
                            badge={data?.account_reputation} />
                    </div>
                    <div className="stat-value text-white text-xl sm:text-3xl">{data?.title}</div>
                    <div className="stat-title text-gray-200">@{community}</div>
                    <p className=" text-xs text-slate-300 lg:line-clamp-2">{data?.about}</p>
                </div>

            </div>
        </div>
    </div>
    )

}
