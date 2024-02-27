
import React from 'react'
import BodyShort from '../../body/BodyShort';
import Image from 'next/image';
import { getPostThumbnail, getResizedAvatar } from '@/libs/utils/image';
import TimeAgoWrapper from '../../TimeAgoWrapper';
import { Card, Popover, PopoverContent, PopoverTrigger, User } from '@nextui-org/react';
import { useSession } from 'next-auth/react';
import Reputation from '@/components/Reputation';
import dynamic from 'next/dynamic';
import CommentFooter from '../component/CommentFooter';
import STag from '@/components/STag';
const DynamicUserCard = dynamic(() => import('../../UserCard'));
import './style.scss'
import { FaClock } from 'react-icons/fa';
import { CommentProps } from '../CommentCard';
import clsx from 'clsx';
import { validateCommunity } from '@/libs/utils/helper';
type Props = {
    comment: Feed | Post;
    isReply?: boolean;
}


export default function CommentGridLayout(props: CommentProps) {
    const { comment, onReplyClick, isReply } = props;

    const thumbnail = getPostThumbnail(comment.json_images);
    console.log(1122, thumbnail)
    const { data: session } = useSession();
    const isSelf = comment.author === session?.user?.name;
    const json_metadata = JSON.parse(comment?.json_metadata ?? '{}') as { tags?: string[], image?: string[], app?: string, format?: string }

    const imageWidth = 200;
    const imageHeight = 176;

    return (
        <Card className={`grid-footer w-full card card-compact h-full bg-white/60
         dark:bg-white/10  pb-2 flex flex-col overflow-hidden rounded-lg shadow-lg`}>

            <div className="flex-shrink-0 relative">
                {thumbnail ?
                    <Image
                        src={thumbnail}
                        width={imageWidth}
                        height={imageHeight}
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

                    /> :
                    <div className={`h-44 
                    bg-foreground/30  w-full`} />
                }

                {/* <div
                    className="hover:bg-transparent transition duration-300 absolute bottom-0 top-0 right-0 left-0 bg-gray-900 opacity-25">
                </div> */}


                <STag className='text-tiny rounded-full border bg-background/90 backdrop-blur-lg p-1
                 absolute m-2 top-0 right-0'
                    content={comment.community ||
                        (validateCommunity(comment.category) ? comment.category :
                            `#${comment.category}`)} tag={comment.category} />

            </div>
            <div className="flex flex-1 flex-col justify-between p-4">
                <div className="flex-1">

                    <Card isPressable={!isReply} radius='none'
                        onClick={() => onReplyClick && onReplyClick(comment)}
                        shadow='none'
                        className={clsx('bg-transparent  w-full text-start')}>
                        <p className="text-md font-semibold text-default-900">{comment.title}</p>
                        <p className="mt-3 text-sm text-default-900/60"><BodyShort body={comment.body} className=' line-clamp-2' /></p>
                    </Card>
                </div>
                <div className=" mt-4 gap-6 flex flex-row items-center justify-between">

                    <Popover showArrow placement="bottom">
                        <PopoverTrigger>
                            <User
                                classNames={{
                                    description: 'mt-1 text-default-900/60 dark:text-gray-200 text-sm',
                                    name: 'text-default-800'
                                }}
                                name={<div className='flex items-center space-x-2'>
                                    {isSelf ? <p>{comment.author}</p> :
                                        <div>{comment.author}</div>
                                    }
                                    <Reputation {...props} reputation={comment.author_reputation} />
                                    {comment.author_role && comment.author_title ?
                                        <div className='flex space-x-2 items-center'>
                                            <p className='flex-none'>
                                                {comment.author_role}
                                            </p>
                                        </div> : null}

                                </div>}
                                description={<div className='flex flex-col'>



                                    {comment.author_title && <div className='flex space-x-1 text-tiny rounded-full 
                                    border hover:bg-transparent border-default-900/50 px-1  '>

                                        {comment.author_title}

                                        {/* {json_metadata?.app && <STooltip content={`${'Posted using'} ${json_metadata?.app}`}>
                                            <p>● {json_metadata?.app?.split('/')?.[0]}</p>
                                        </STooltip>} */}
                                    </div>}

                                </div>}
                                avatarProps={{
                                    className: '',
                                    src: getResizedAvatar(comment.author),
                                    // as: 'a',
                                    // onClick: () => {
                                    //     navigation.push(authorLink);
                                    // },


                                }}
                            />
                        </PopoverTrigger>
                        <PopoverContent className="p-1">
                            <DynamicUserCard username={comment.author} />
                        </PopoverContent>
                    </Popover>
                    {/* <Button size='sm' variant='light' radius='full' isIconOnly>
                        <FaEllipsisVertical className='text-lg' />
                    </Button> */}

                </div>

            </div>

            <div className="px-4 flex flex-row items-center justify-between">
                <span className="py-1 text-xs font-regular text-default-900 mr-1 flex flex-row items-center">

                    <FaClock className=' text-sm' />
                    <span className="ml-1">
                        <TimeAgoWrapper lang={'en'} created={comment.created * 1000} lastUpdate={comment.last_update * 1000} />

                    </span>
                </span>

                <span className="py-1 text-xs font-regular text-default-900 mr-1 flex flex-row items-center">
                    <svg className="h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z">
                        </path>
                    </svg>
                    <span className="ml-1">{comment.children} Comments</span>
                </span>
            </div>
            <div className='px-2'>
                <CommentFooter compact className='rounded-lg' comment={comment} />
            </div>
        </Card>

    )
}
