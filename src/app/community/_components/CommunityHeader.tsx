'use client';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { useAppDispatch } from '@/libs/constants/AppFunctions';
import { addProfileHandler } from '@/libs/redux/reducers/ProfileReducer';
import usePathnameClient from '@/libs/utils/usePathnameClient';
import UserCoverCard from '@/components/UserCoverCard';
import { abbreviateNumber } from '@/libs/utils/helper';
import Reputation from '@/components/Reputation';
import BadgeAvatar from '@/components/BadgeAvatar';
import ProfileInfoCard from '@/components/ProfileInfoCard';
import { Popover, PopoverTrigger, Button, PopoverContent } from '@nextui-org/react';
import { BsInfoCircleFill } from 'react-icons/bs';
import { useMobile } from '@/libs/utils/useMobile';
import VanillaTilt from 'vanilla-tilt';

interface Props {
    data: Community;

}
export default function CommunityHeader(props: Props) {
    const { data } = props;
    const { community } = usePathnameClient();
    const dispatch = useAppDispatch();
    const cardRef = useRef<HTMLElement | undefined | any>();
    const isMobile = useMobile();

    useEffect(() => {


        if (!isMobile && cardRef && cardRef.current)
            VanillaTilt.init(cardRef.current);

    }, []);




    return (<div className='w-full p-1 relative '>
        <div className='card flex items-center w-full relative  shadow-none' >

            <UserCoverCard src={'/steempro-cover.png'} />


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
                            <div className="stat-title text-default-900">{'Rank'}</div>
                            <div className="stat-value">{abbreviateNumber(data.rank)}</div>
                            <div className="stat-desc"></div>
                        </div>

                        <div className="stat">
                            <div className="stat-figure text-secondary">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            </div>
                            <div className="stat-title text-default-900">{'Subscribers'}</div>
                            <div className="stat-value text-secondary"> {abbreviateNumber(data.count_subs)}</div>
                            <div className="stat-desc"></div>
                        </div>
                    </div>

                    <div className="profile-card stat">
                        <div className="stat-figure text-secondary">
                            <BadgeAvatar {...props} username={data.account} size={'lg'} quality='medium'
                                badge={data.account_reputation} />
                            {/* <Avatar {...props}

                        src={data.name} xl size={'lg'} quality='medium' sizeNumber={60}
                        badge={profileInfo?.reputation} /> */}
                        </div>
                        <div className="stat-value text-default-800 text-xl sm:text-3xl">{data.title}</div>
                        <div className="stat-title flex space-x-2 items-center">
                            <div className="stat-title flex flex-row items-center text-default-900 gap-2">
                                <p>@{data.account}</p>
                                <Reputation reputation={data.account_reputation} />
                            </div>

                            <div className=''>
                                <Popover placement={'bottom'} color="default" >
                                    <PopoverTrigger>
                                        <Button isIconOnly radius='full' size='sm' variant='light'>
                                            <BsInfoCircleFill className='text-xl' />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                        <p>Community</p>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                        <div className="stat-desc text-default-900 line-clamp-1 max-w-xs">{data.about}</div>
                    </div>

                </div>
            </div>
        </div>
    </div>
    )
}