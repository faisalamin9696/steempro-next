"use client"

import React, { memo, useEffect } from 'react'
import { Avatar, AvatarGroup } from '@nextui-org/avatar'
import { fetchSds, useAppDispatch, useAppSelector } from '@/libs/constants/AppFunctions'
import { useSession } from 'next-auth/react';
import LoadingCard from '@/components/LoadingCard';
import useSWR from 'swr';
import { SlUserFollowing } from 'react-icons/sl';
import clsx from 'clsx';
import SAvatar from '@/components/SAvatar';
import STooltip from '@/components/STooltip';
import { abbreviateNumber } from '@/libs/utils/helper';
import { getResizedAvatar } from '@/libs/utils/image';
import TimeAgoWrapper from '@/components/wrapper/TimeAgoWrapper'
import { getClubStatus, getVoteData } from '@/libs/steem/sds'
import FollowButton from './FollowButton';
import { useRouter } from 'next13-progressbar';
import { addProfileHandler } from '@/libs/redux/reducers/ProfileReducer';
import Link from 'next/link';


const getClubString = (clubData?: Club) => {
    if (!clubData) return "";
    const str =
        clubData.powered_up >= 100
            ? "100"
            : clubData.powered_up >= 75
                ? "75"
                : clubData.powered_up >= 50
                    ? "5050"
                    : "None";
    return str;
};


type Props = {
    username?: string;
    data?: AccountExt;
    profile?: boolean;
    community?: Community;
    className?: string;
    hideAvatar?: boolean;
} & (
        { username: string } |
        { data: AccountExt } |
        { community: Community }
    );

export default memo(function ProfileInfoCard(props: Props) {

    const { username, profile, community, data: accountExt, hideAvatar } = props;
    const { data: session } = useSession();
    const loginInfo = useAppSelector(state => state.loginReducer.value);

    const URL = `/accounts_api/getAccountExt/${username}/${loginInfo.name || 'null'}`;
    let { data, isLoading } = useSWR(accountExt ? undefined : URL, fetchSds<AccountExt>);
    const isSelf = !!loginInfo.name && (loginInfo.name === (username || data?.name));

    if (accountExt)
        data = accountExt;

    const profileInfo: AccountExt = useAppSelector(state => state.profileReducer.value)[username ?? data?.name ?? ''] ?? data;
    const communityInfo = useAppSelector(state => state.communityReducer.values)[community?.account ?? ''] ?? community;

    const { data: clubData } = useSWR(username || profileInfo?.name, getClubStatus);

    const posting_json_metadata = JSON.parse(profileInfo?.posting_json_metadata || '{}')

    const URL_2 = `/followers_api/getKnownFollowers/${username || profileInfo?.name}/${loginInfo.name || 'null'}`
    const { data: knownPeople, isLoading: isKnownLoading } =
        useSWR(!!loginInfo.name ? URL_2 : undefined, fetchSds<string[]>)
    const steemProps = useAppSelector(state => state.steemGlobalsReducer).value;
    const voteData = profileInfo && getVoteData(profileInfo, steemProps);
    const router = useRouter();
    const dispatch = useAppDispatch();


    useEffect(() => {
        if (data) {
            dispatch(addProfileHandler(data));
        }

    }, []);

    if (isLoading) {
        return <LoadingCard />
    }


    const detailItems = [
        { title: 'Vote Value', desc: `$${voteData?.full_vote?.toFixed(3)}` },
        { title: 'VP', desc: `${profileInfo?.upvote_mana_percent}%` },
        { title: 'Self Voting', desc: `${profileInfo?.selfvote_rate}%` },
        { title: 'CSI', desc: `${profileInfo?.voting_csi}%` },
        { title: 'RC', desc: `${profileInfo?.rc_mana_percent}%` },
        { title: 'Club', desc: getClubString(clubData) }
    ]


    return (
        <div
            className={clsx(`relative flex flex-col card-content border-none  rounded-lg
        bg-transparent items-start gap-4 p-2 w-full bg-white dark:bg-white/5`, props.className)}>
            <div className="flex flex-row justify-between gap-2 w-full">
                <div className="flex gap-2">
                    {!hideAvatar && <SAvatar 
                        className='cursor-pointer' size='sm'
                        username={username || profileInfo?.name || ''} />}
                    <div className="flex flex-col items-start justify-center">
                        <h4 className="text-sm font-semibold leading-none text-default-600">{posting_json_metadata?.profile?.name}</h4>
                        {/* <Link prefetch={false} href={authorLink}>{comment.author}</Link> */}

                        <h5 className={clsx("text-small tracking-tight text-default-500")}>@{username || profileInfo?.name}</h5>

                        <div className='flex text-sm gap-1 text-default-600 items-center'>
                            <p className='text-default-500 text-tiny'>Joined</p>
                            <TimeAgoWrapper className='text-tiny' created={(profileInfo?.created || 0) * 1000} />
                        </div>

                    </div>
                </div>


                {profileInfo && <FollowButton account={profileInfo} community={communityInfo} />}
                {/* <Button
                    isDisabled={isLoading}
                    color={data?.observer_follows_author ? 'warning' : "secondary"}
                    radius="full"
                    size='sm'
                    className='min-w-0  h-6'
                    title={data?.observer_follows_author ? 'Unfollow' : 'Follow'}
                    variant={data?.observer_follows_author ? "bordered" : "solid"}
                    onClick={() => { }}

                >
                    {data?.observer_follows_author ? 'Unfollow' : 'Follow'}

                </Button> */}

            </div>



            <div className="flex flex-row gap-2" >
                <div className="flex gap-1">
                    <p title={profile ? profileInfo?.count_followers?.toString() : profileInfo?.count_root_posts?.toString()}
                        className="font-semibold text-default-600 text-small">
                        {abbreviateNumber(profile ? profileInfo?.count_followers : profileInfo?.count_root_posts)}</p>
                    <p className=" text-default-500 text-small">{profile ? 'Followers' : 'Posts'}</p>
                </div>
                <div className="flex gap-1">
                    <p title={profile ? profileInfo?.count_following?.toString() : profileInfo?.count_comments?.toString()}
                        className="font-semibold text-default-600 text-small">
                        {abbreviateNumber(profile ? profileInfo?.count_following : profileInfo?.count_comments)}</p>
                    <p className="text-default-500 text-small">{profile ? 'Following' : 'Comments'}</p>
                </div>

            </div>

            <div className=" w-full">
                <div className="flex gap-2 items-center text-gray-800 
          dark:text-gray-300 mb-4 ">

                    <SlUserFollowing className={clsx('h-4 w-4', " text-gray-600 dark:text-gray-400")} />
                    <span className='text-sm text-default-600'>
                        <strong
                            className={clsx('text-sm')}>{knownPeople?.length}</strong> Followers you know</span>
                </div>
                <div className="flex px-2">
                    <AvatarGroup isBordered size="sm">
                        {knownPeople?.map((people) => {
                            return (<STooltip content={people}>
                                <Link href={`/@${people}/posts`}>
                                    <Avatar src={getResizedAvatar(people)} />
                                </Link>
                            </STooltip>)


                        })}

                    </AvatarGroup>

                </div>

                <div className='grid grid-cols-2 mt-4 gap-4'>
                    {detailItems.map(item => {
                        return <div className='flex flex-col gap-1 text-sm flex-1'>
                            <p className='text-default-500 text-tiny font-light'>{item.title}</p>
                            <p className='text-bold'>{item.desc}</p>
                        </div>

                    })}

                </div>


                {/* {voteData &&
                    <div className='text-default-600 flex flex-row  mt-4'>

                        <div className='flex flex-col gap-1 text-sm flex-1'>
                            <p className='text-default-500'>VP</p>
                            <p>{data?.upvote_mana_percent}</p>
                        </div>

                        <div className='flex flex-col gap-1 text-sm  flex-1'>
                            <p className='text-default-500'>Vote Value</p>
                            <p>{voteData.full_vote.toFixed(2)}</p>
                        </div>

                    </div>}

                <div className='text-default-600 flex flex-row mt-4'>
                    {voteData && <div className='flex flex-col gap-1 text-sm flex-1'>
                        <p className='text-default-500'>RC</p>
                        <p>{data?.rc_mana_percent}</p>
                    </div>}

                    <div className='flex flex-col gap-1 text-sm flex-1'>
                        <p className='text-default-500'>CLUB Status</p>
                        <p>{'5050'}</p>
                    </div>

                </div> */}



            </div>

        </div >
    );

}
)