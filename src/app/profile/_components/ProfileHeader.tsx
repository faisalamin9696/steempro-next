"use client"

import React, { useEffect } from 'react';
import { BsInfoCircleFill } from 'react-icons/bs';
import { Avatar, Button, Card, Popover, PopoverContent, PopoverTrigger } from '@nextui-org/react'
import { useAppDispatch, useAppSelector } from '@/libs/constants/AppFunctions';
import { addProfileHandler } from '@/libs/redux/reducers/ProfileReducer';
import { getSettings } from '@/libs/utils/user';
import { getResizedAvatar } from '@/libs/utils/image';
import ProfileStart from '../(site)/@start/page';
import { proxifyImageUrl } from '@/libs/utils/ProxifyUrl';
import dynamic from 'next/dynamic';
const DynamicCover = dynamic(() => import('@/components/UserCoverCard'))
interface Props {
    data: AccountExt;
}
export default function ProfileHeader(props: Props) {
    const { data } = props;
    const profileInfo = useAppSelector(state => state.profileReducer.value)[data.name] ?? data;
    const settings = useAppSelector(state => state.settingsReducer.value) ?? getSettings();
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (data) {
            dispatch(addProfileHandler(data));
        }
    }, []);

    const cover_picture = proxifyImageUrl(profileInfo?.posting_json_metadata?.profile?.cover_image ?? '');
    return (<div className='w-full p-1 relative '>
        <div className='card flex items-center w-full relative '>

            <DynamicCover src={cover_picture} />


            <div className={`stats bg-default-100/50 dark:bg-default-400/50 backdrop-blur-md transition-all shadow m-auto  top-5 absolute mx-2 
              max-[720px]:flex max-[720px]:flex-col`}>
                <div className='flex'>
                    <div className="stat">
                        <div className="stat-figure text-primary-900">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                        </div>
                        <div className="stat-title text-default-600">{'Followers'}</div>
                        <div className="stat-value text-primary-900">{profileInfo?.count_followers}</div>
                        <div className="stat-desc"></div>
                    </div>

                    <div className="stat">
                        <div className="stat-figure text-secondary">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                        <div className="stat-title text-default-600">{'Followings'}</div>
                        <div className="stat-value text-secondary">{profileInfo?.count_following}</div>
                        <div className="stat-desc"></div>
                    </div>
                </div>

                <div className="stat">
                    <div className="stat-figure text-secondary">
                        <Avatar src={getResizedAvatar(data.name)} size='lg' />
                        {/* <Avatar {...props}

                            src={data.name} xl size={'lg'} quality='medium' sizeNumber={60}
                            badge={profileInfo?.reputation} /> */}
                    </div>
                    <div className="stat-value text-default-700 text-xl sm:text-3xl">{profileInfo?.posting_json_metadata?.profile?.name}</div>
                    <div className="stat-title text-default-600 flex space-x-2 items-center">
                        <p>{data.name}</p>
                        <div className='block md:hidden'>
                            <Popover placement={'bottom'} color="primary" >
                                <PopoverTrigger>
                                    <Button isIconOnly radius='full' size='sm' variant='light'><BsInfoCircleFill className='text-xl' /></Button>
                                </PopoverTrigger>
                                <PopoverContent>
                                    <ProfileStart />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <div className="stat-desc text-default-600 line-clamp-1 max-w-xs">{profileInfo?.posting_json_metadata?.profile?.about}</div>
                </div>

            </div>
        </div>
    </div>
    )
}
