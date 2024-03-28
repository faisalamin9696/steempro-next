import React, { memo } from "react";
import { Card } from "@nextui-org/card";
import { User } from "@nextui-org/user";
import { abbreviateNumber } from "@/libs/utils/helper";
import TimeAgoWrapper from "../wrappers/TimeAgoWrapper";
import { getResizedAvatar } from "@/libs/utils/image";
import Link from "next/link";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";


interface Props {
    community: Community;
    compact?: boolean;
    className?: string;
    endContent?: React.ReactNode;


}


export const CommunityCard = memo((props: Props) => {
    const { community, compact, endContent } = props;



    return (
        <Card

            className={twMerge(`relative flex flex-col items-start gap-2 w-full bg-white
             dark:bg-white/5`, compact ? 'p-2' : 'p-4', props.className)}>

            <div className="top-2 right-3 absolute">
                {endContent}
            </div>


            <User

                classNames={{
                    description: 'text-default-900/60 dark:text-gray-200 text-sm mt-1',
                    name: 'text-default-800'
                }}
                name={<div className='flex flex-col items-start gap-1'>

                    <Link className="hover:text-blue-500 font-semibold" href={`/trending/${community.account}`}>{community.title}</Link>

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
                    as: Link,
                    href: `/trending/${community.account}`
                } as any}
            />
            <p title={community.about} className={clsx(compact ? 'text-tiny line-clamp-2' : '')}>
                {community.about}
            </p>
            <div className={clsx("flex flex-row gap-4", compact ? 'text-tiny' : '')}>
                <div className="flex gap-1">
                    <p className="font-semibold text-default-600 ">{abbreviateNumber(community.count_subs)}</p>
                    <p className=" text-default-500">{compact ? 'Subs' : 'Subscribers'}</p>
                </div>
                <div className="flex gap-1">
                    <p className="font-semibold text-default-600 ">${abbreviateNumber(community.count_pending)}</p>
                    <p className="text-default-500">{compact ? 'Reward' : 'Pending Reward'}</p>
                </div>
            </div>

        </Card >
    );
});

export default CommunityCard