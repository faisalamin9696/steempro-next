"use client";

import React from 'react'
import BodyShort from '../../body/BodyShort';
import Image from 'next/image';
import { getPostThumbnail, getResizedAvatar } from '@/libs/utils/image';
import TimeAgoWrapper from '../../wrapper/TimeAgoWrapper';
import { Card, CardBody, User } from '@nextui-org/react';
import Reputation from '@/components/Reputation';
import dynamic from 'next/dynamic';
import CommentFooter from '../component/CommentFooter';
import STag from '@/components/STag';
const DynamicUserCard = dynamic(() => import('../../UserCard'));
import './style.scss'
import { CommentProps } from '../CommentCard';
import clsx from 'clsx';
import { abbreviateNumber, validateCommunity } from '@/libs/utils/helper';
import { useAppSelector } from '@/libs/constants/AppFunctions';
import Link from 'next/link';
import { hasNsfwTag } from '@/libs/utils/StateFunctions';
import NsfwOverlay from '@/components/NsfwOverlay';
import { getSettings } from '@/libs/utils/user';


export default function CommentGridLayout(props: CommentProps) {
    const { comment, isReply } = props;
    const commentInfo: Feed | Post = useAppSelector(state => state.commentReducer.values)[`${comment.author}/${comment.permlink}`] ?? comment;
    const settings = useAppSelector(state => state.settingsReducer.value) ?? getSettings();
    const loginInfo = useAppSelector(state => state.loginReducer.value);
    const thumbnail = getPostThumbnail(commentInfo.json_images);
    const isSelf = !!loginInfo.name && (loginInfo.name === (commentInfo.author));
    // const json_metadata = JSON.parse(comment?.json_metadata ?? '{}') as { tags?: string[], image?: string[], app?: string, format?: string }
    const targetUrl = `/${comment.category}/@${comment.author}/${comment.permlink}`;

    const imageWidth = 200;
    const imageHeight = 176;
    const isNsfw = hasNsfwTag(comment) && (settings.nsfw !== 'Always show');

    return (
        <Card className={`grid-footer w-full card card-compact h-full bg-white/60
         dark:bg-white/10  pb-2 flex flex-col  rounded-lg shadow-lg overflow-visible`}>

            <CardBody className='flex flex-col p-0' as={Link} href={targetUrl}>
                <>
                    <div className={clsx(commentInfo.is_muted && ' opacity-80', "flex-shrink-0 relative ")}>
                        {thumbnail ?
                            <div className='relative'>
                                <Image
                                    src={thumbnail}
                                    width={imageWidth}
                                    height={imageHeight}
                                    className={isNsfw ? 'blur-[2px]' : ""}
                                    alt={''}
                                    sizes="(max-width: 768px) 100vw,
                        (max-width: 1200px) 50vw,
                        33vw"
                                    style={{
                                        width: '100%',
                                        objectFit: 'cover',
                                        minHeight: imageHeight,
                                        maxHeight: imageHeight,
                                    }}

                                />

                                {isNsfw && <NsfwOverlay />}
                            </div>
                            :
                            <div className={`h-44   bg-foreground/30  w-full`} />
                        }


                        <STag className={`text-tiny rounded-full border bg-background/90 backdrop-blur-lg 
                        py-1 px-2  absolute m-2 top-0 right-0`}
                            content={commentInfo.community ||
                                (validateCommunity(commentInfo.category) ? commentInfo.category :
                                    `#${commentInfo.category}`)} tag={commentInfo.category} />

                    </div>

                    <div className="flex flex-1 flex-col justify-between p-4">
                        <div className={clsx(commentInfo.is_muted && ' opacity-80', "flex-1")}>

                            <Card radius='none'
                                shadow='none'
                                className={clsx('bg-transparent  w-full text-start')}>
                                <p className="text-md font-semibold text-default-900">{commentInfo.title}</p>
                                <p className="mt-3 text-sm text-default-900/60"><BodyShort body={commentInfo.body} className=' line-clamp-2' /></p>
                            </Card>
                        </div>



                    </div>
                </>
            </CardBody>
            <div className="px-4 mt-4 gap-6 flex flex-row items-center justify-between">

                <User
                    classNames={{
                        description: 'text-default-900/60 dark:text-gray-200 text-sm',
                        name: 'text-default-800'
                    }}
                    name={<div className='flex items-center space-x-2'>
                        {isSelf ? <p>{commentInfo.author}</p> :
                            <div>{commentInfo.author}</div>
                        }
                        <Reputation {...props} reputation={commentInfo.author_reputation} />

                    </div>}
                    description={<div className='flex flex-col'>
                        <TimeAgoWrapper lang={'en'} created={commentInfo.created * 1000} lastUpdate={commentInfo.last_update * 1000} />

                    </div>}
                    avatarProps={{
                        className: 'cursor-pointer',
                        src: getResizedAvatar(commentInfo.author),
                        as: Link,
                        href: `/@${commentInfo.author}`
                    } as any}
                />

            </div>
            <div className="px-4 flex flex-row items-center justify-between ">
                <div> {!!commentInfo.resteem_count && <span title={commentInfo.resteem_count + ' Resteem'}
                    className="py-1 text-xs font-regular text-default-600 mr-1 flex flex-row items-center">
                    {abbreviateNumber(commentInfo.resteem_count)} Resteem
                </span>}
                </div>

                <span title={`${commentInfo.children} Comments`}
                    className="py-1 text-xs font-regular text-default-600 mr-1 flex flex-row items-center">
                    <svg className="h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z">
                        </path>
                    </svg>
                    <span className="ml-1">{commentInfo.children}</span>
                </span>
            </div>
            <div className='px-2'>
                <CommentFooter compact
                    className='rounded-lg'
                    comment={commentInfo} />
            </div>
        </Card>

    )
}
