'use client';
import React, { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/libs/constants/AppFunctions';
import usePathnameClient from '@/libs/utils/usePathnameClient';
import UserCoverCard from '@/components/UserCoverCard';
import { abbreviateNumber } from '@/libs/utils/helper';
import Reputation from '@/components/Reputation';
import ProfileInfoCard from '@/components/ProfileInfoCard';
import { Popover, PopoverTrigger, Button, PopoverContent } from '@nextui-org/react';
import { BsInfoCircleFill } from 'react-icons/bs';
import VanillaTilt from 'vanilla-tilt';
import { useDeviceInfo } from '@/libs/utils/useDeviceInfo';
import SAvatar from '@/components/SAvatar';
import { FaDollarSign } from 'react-icons/fa';
import { proxifyImageUrl } from '@/libs/utils/ProxifyUrl';
import clsx from 'clsx';
import { useRouter } from 'next13-progressbar';
import { usePathname } from 'next/navigation';
import { addProfileHandler } from '@/libs/redux/reducers/ProfileReducer';
import { addCommunityHandler } from '@/libs/redux/reducers/CommunityReducer';
import { twMerge } from 'tailwind-merge';

type Props = (
    {
        community?: Community;
        account: AccountExt;
    } |
    {
        community: Community;
        account?: AccountExt;
    }
)
export default function AccountHeader(props: Props) {
    const { community, account } = props;
    const cardRef = useRef<HTMLElement | undefined | any>();
    const { isDesktop } = useDeviceInfo();
    const isCommunity = !!community;
    const isAccount = !!account;
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useAppDispatch();

    useEffect(() => {
        router.refresh();
    }, [pathname]);


    const communityInfo = useAppSelector(state => state.communityReducer.values)[community?.account ?? ''] ?? community;
    const profileInfo = useAppSelector(state => state.profileReducer.value)[account?.name ?? ''] ?? account;

    const posting_json_metadata = JSON.parse(profileInfo?.posting_json_metadata || '{}');
    const cover_picture = isCommunity ? '/steempro-cover.png' :
        proxifyImageUrl(posting_json_metadata?.profile?.cover_image ?? '');

    useEffect(() => {


        if (isCommunity) {
            dispatch(addCommunityHandler({ ...community }));
        } else {
            dispatch(addProfileHandler(account));
        }



        if (isDesktop && cardRef && cardRef.current)
            VanillaTilt.init(cardRef.current);
    }, []);

    return (<div className='w-full p-1 relative '>
        <div className='card flex items-center w-full relative  shadow-none' >

            <UserCoverCard large={isCommunity} src={cover_picture} />

            <div ref={cardRef} data-tilt-speed="600" data-tilt data-tilt-max="5"
                data-tilt-perspective="600" data-tilt-glare
                data-tilt-max-glare={0.5}
                className={`account-header backdrop-blur-sm shadow-md m-auto top-5 absolute mx-2  
            bg-black/20  rounded-xl`} >
                <div className={twMerge(' flex shadow-md px-0 text-white', isCommunity ? 'max-2md:flex max-2md:flex-col' :
                    'max-[720px]:flex max-[720px]:flex-col')}>
                    <div className='flex '>
                        <div className="stat">
                            <div className="stat-figure">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                            </div>
                            <div className="stat-title text-white/60">{isCommunity ? 'Rank' : 'Followers'}</div>
                            <div className={twMerge("stat-value", 'max-md:text-medium')}>{abbreviateNumber(isCommunity ? communityInfo.rank : profileInfo.count_followers)}</div>
                            <div className="stat-desc"></div>
                        </div>

                        <div className="stat">
                            <div className="stat-figure text-secondary">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            </div>
                            <div className="stat-title text-white/60">{isCommunity ? 'Members' : 'Followings'}</div>
                            <div className="stat-value text-secondary max-md:text-medium"> {abbreviateNumber(isCommunity ? communityInfo.count_subs : profileInfo.count_following)}</div>
                            <div className="stat-desc"></div>
                        </div>

                        {isCommunity && <div className="stat">
                            <div className="stat-figure text-info">
                                <FaDollarSign className='text-2xl' />
                            </div>
                            <div className="stat-title text-white/60">{'Reward'}</div>
                            <div className="stat-value text-info max-md:text-medium"> {abbreviateNumber(communityInfo.sum_pending)}</div>
                            <div className="stat-desc"></div>
                        </div>}
                    </div>

                    <div className="profile-card stat">
                        <div className="stat-figure text-secondary relative">

                            <SAvatar username={isCommunity ? communityInfo.account : profileInfo.name} size='lg' />

                            {/* <BadgeAvatar {...props} username={communityInfo.account} size={'lg'} quality='medium'
                                badge={'Subscribe'} /> */}
                            {/* <Avatar {...props}

                        src={communityInfo.name} xl size={'lg'} quality='medium' sizeNumber={60}
                        badge={profileInfo?.reputation} /> */}
                        </div>
                        <div className="stat-value text-white dark:text-white/80 text-xl sm:text-3xl">{isCommunity ? communityInfo.title : posting_json_metadata?.profile?.name}</div>
                        <div className="stat-title flex space-x-2 items-center">
                            <div className="stat-title flex flex-row items-center text-white/90 gap-2">
                                <p>@{isCommunity ? communityInfo.account : profileInfo.name}</p>
                                <Reputation reputation={isCommunity ? communityInfo.account_reputation : profileInfo.reputation} />
                            </div>

                            <div className=''>
                                <Popover placement={'bottom'} color="default"
                                    style={{ zIndex: 50 }} >
                                    <PopoverTrigger>
                                        <Button isIconOnly radius='full' size='sm' variant='light' className='text-white/80'>
                                            <BsInfoCircleFill className='text-xl' />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                        <ProfileInfoCard className='!bg-transparent'
                                            community={communityInfo}
                                            username={isCommunity ? communityInfo.account : profileInfo.name} />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                        <div className="stat-desc text-default-900 line-clamp-1 max-w-xs text-white/80">{isCommunity ? communityInfo.about : posting_json_metadata?.profile?.about}</div>
                        {/* <div>
                            <Button radius='full' variant='flat' color={communityInfo.observer_subscribed ? 'danger' : 'primary'}
                                size='sm'>{communityInfo.observer_subscribed ? 'Leave' : "Subscribe"}</Button>

                        </div> */}

                    </div>

                </div>
            </div>
        </div>
    </div>
    )
}