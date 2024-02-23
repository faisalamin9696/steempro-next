"use client"

import React, { useEffect, useRef } from 'react';
import { BsInfoCircleFill } from 'react-icons/bs';
import { Button, Popover, PopoverContent, PopoverTrigger } from '@nextui-org/react'
import { useAppDispatch, useAppSelector } from '@/libs/constants/AppFunctions';
import { addProfileHandler } from '@/libs/redux/reducers/ProfileReducer';
import { getSettings } from '@/libs/utils/user';
import { proxifyImageUrl } from '@/libs/utils/ProxifyUrl';
import dynamic from 'next/dynamic';
import SAvatar from '@/components/SAvatar';
import Reputation from '@/components/Reputation';
import VanillaTilt from "vanilla-tilt";
import { useMobile } from '@/libs/utils/useMobile';
import './style.scss'
import { abbreviateNumber } from '@/libs/utils/helper';
import ProfileInfoCard from '../../../components/ProfileInfoCard';

const DynamicCover = dynamic(() => import('@/components/UserCoverCard'))
interface Props {
    data: AccountExt;
}
export default function ProfileHeader(props: Props) {
    const { data } = props;
    const profileInfo = useAppSelector(state => state.profileReducer.value)[data.name] ?? data;
    const settings = useAppSelector(state => state.settingsReducer.value) ?? getSettings();
    const dispatch = useAppDispatch();
    const cardRef = useRef<HTMLElement | undefined | any>();
    const isMobile = useMobile();
    const posting_json_metadata = JSON.parse(profileInfo?.posting_json_metadata || '{}');

    useEffect(() => {
        if (data) {
            dispatch(addProfileHandler(data));
        }
        if (!isMobile && cardRef && cardRef.current)
            VanillaTilt.init(cardRef.current);


    }, []);

    const cover_picture = proxifyImageUrl(posting_json_metadata?.profile?.cover_image ?? '');
    return (<div className='w-full p-1 relative '>
        <div className='card flex items-center w-full relative  shadow-none' >

            <DynamicCover src={cover_picture} />


            <div ref={cardRef} data-tilt-speed="600" data-tilt data-tilt-max="5"
                data-tilt-perspective="600" data-tilt-glare
                data-tilt-max-glare={0.5}
                className={`profile-header backdrop-blur-sm shadow-md m-auto top-5 absolute mx-2 
                bg-background/40  rounded-xl`} >
                <div className=' flex max-[720px]:flex max-[720px]:flex-col shadow-md px-4'>
                    <div className='flex '>
                        <div className="stat">
                            <div className="stat-figure">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                            </div>
                            <div className="stat-title text-default-900">{'Followers'}</div>
                            <div className="stat-value">{abbreviateNumber(profileInfo?.count_followers)}</div>
                            <div className="stat-desc"></div>
                        </div>

                        <div className="stat">
                            <div className="stat-figure text-secondary">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            </div>
                            <div className="stat-title text-default-900">{'Followings'}</div>
                            <div className="stat-value text-secondary"> {abbreviateNumber(profileInfo?.count_following)}</div>
                            <div className="stat-desc"></div>
                        </div>
                    </div>

                    <div className="profile-card stat">
                        <div className="stat-figure text-secondary">
                            <SAvatar {...props} username={data.name} size={'lg'} quality='medium'
                                badge={data?.reputation} />
                            {/* <Avatar {...props}

                            src={data.name} xl size={'lg'} quality='medium' sizeNumber={60}
                            badge={profileInfo?.reputation} /> */}
                        </div>
                        <div className="stat-value text-default-800 text-xl sm:text-3xl">{posting_json_metadata?.profile?.name}</div>
                        <div className="stat-title flex space-x-2 items-center">
                            <div className="stat-title flex flex-row items-center text-default-900 gap-2">
                                <p>@{data.name}</p>
                                <Reputation reputation={data.reputation} />
                            </div>

                            <div className=''>
                                <Popover placement={'bottom'} color="default" >
                                    <PopoverTrigger>
                                        <Button isIconOnly radius='full' size='sm' variant='light'>
                                            <BsInfoCircleFill className='text-xl' />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                        <ProfileInfoCard data={data} />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                        <div className="stat-desc text-default-900 line-clamp-1 max-w-xs">{posting_json_metadata?.profile?.about}</div>
                    </div>

                </div>
            </div>
        </div>
    </div>
    )
}
