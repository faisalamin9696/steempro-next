import React, { memo } from "react";
import { Button } from "@nextui-org/button";
import { Card } from "@nextui-org/card";
import { User } from "@nextui-org/user";
import { abbreviateNumber } from "@/libs/utils/helper";
import TimeAgoWrapper from "./wrapper/TimeAgoWrapper";
import { getResizedAvatar } from "@/libs/utils/image";
import Link from "next/link";
import clsx from "clsx";
import { LuPencilLine } from "react-icons/lu";
import { useAppSelector } from "@/libs/constants/AppFunctions";
import usePathnameClient from "@/libs/utils/usePathnameClient";


interface Props {
    community: Community;
    compact?: boolean;
}


export const CommunityCard = memo((props: Props) => {
    const { username } = usePathnameClient();
    const { community, compact } = props;
    const loginInfo = useAppSelector(state => state.loginReducer.value);
    const isSelf = !!loginInfo.name && (loginInfo.name === username);



    return (
        <Card

            className={clsx(`relative flex flex-col items-start gap-2 w-full bg-white
             dark:bg-white/5`, compact ? 'p-2' : 'p-4')}>

            {!compact &&
                <div className="flex flex-row items-center gap-1 top-5 right-5 absolute">

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

                </div>}

            <User

                classNames={{
                    description: 'text-default-900/60 dark:text-gray-200 text-sm mt-1',
                    name: 'text-default-800'
                }}
                name={<div className='flex flex-col items-start gap-1'>

                    <h2>{community.title}</h2>

                    <div className="flex gap-2 items-center text-xs">
                        {<p>{community.account} </p>}
                        •
                        <TimeAgoWrapper lang={'en'} created={community.created * 1000} />
                        {/* <Reputation {...props} reputation={community.account_reputation} /> */}

                    </div>

                </div>}
                description={<div className='flex flex-col'>

                    {!compact && community.observer_role && community.observer_title ?
                        <div className='flex space-x-2 items-center'>
                            <p className='flex-none'>
                                {community.observer_role}
                            </p>
                            <p className='flex-none dark:bg-default-900/30 max-sm:text-xs px-1  rounded-lg inline-block'>{community.observer_title}</p>
                        </div> : null}

                    {/* <div className='time-div flex space-x-1'>
                        <TimeAgoWrapper lang={'en'} created={community.created * 1000} />
                       
                    </div> */}

                </div>}
                avatarProps={{
                    className: compact ? 'h-8 w-8' : '',
                    src: getResizedAvatar(community.account),
                    // as: 'a',
                    // onClick: () => {
                    //     navigation.push(authorLink);
                    // },


                }}
            />
            <p title={community.about} className="text-tiny line-clamp-1">
                {community.about}
            </p>
            <div className="flex flex-row gap-4">
                <div className="flex gap-1">
                    <p className="font-semibold text-default-600 text-tiny">{abbreviateNumber(community.count_subs)}</p>
                    <p className=" text-default-500 text-tiny">{compact ? 'Subs' : 'Subscribers'}</p>
                </div>
                <div className="flex gap-1">
                    <p className="font-semibold text-default-600 text-tiny">${abbreviateNumber(community.count_pending)}</p>
                    <p className="text-default-500 text-tiny">{compact ? 'Reward' : 'Pending Reward'}</p>
                </div>
            </div>

        </Card >
    );
});

export default CommunityCard