import { Popover, PopoverContent, PopoverTrigger, User } from '@nextui-org/react'
import clsx, { ClassValue } from 'clsx'
import { FaEllipsis } from "react-icons/fa6";
import { useAppSelector } from '@/libs/constants/AppFunctions';
import Reputation from '@/components/Reputation';
import IconButton from '@/components/IconButton';
import { getResizedAvatar } from '@/libs/utils/image';
import TimeAgoWrapper from '@/components/TimeAgoWrapper';
import { validateCommunity } from '@/libs/utils/helper';
import { getSettings } from '@/libs/utils/user';
import STag from '@/components/STag';

import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import STooltip from '@/components/STooltip';
const DynamicUserCard = dynamic(() => import('../../UserCard'));

interface Props {
    comment: Post | Feed;
    size?: 'sm' | 'md';
    className?: ClassValue;
    isReply?: boolean;
}
export default function CommentHeader(props: Props) {

    const { comment, className, isReply } = props;
    const json_metadata = JSON.parse(comment?.json_metadata ?? '{}') as { tags?: string[], image?: string[], app?: string, format?: string }
    const { data: session } = useSession();
    const isSelf = comment.author === session?.user?.name;
    const authorLink = `/@${comment.author}/friends`;
    const settings = useAppSelector(state => state.settingsReducer.value) ?? getSettings();

    return (<div className={clsx('main-comment-list flex card-content w-auto relative items-center', className)}>

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

                        {isReply ? <IconButton size='sm' IconType={FaEllipsis} /> : null}
                    </div>}
                    description={<div className='flex flex-col'>

                        {comment.author_role && comment.author_title ?
                            <div className='flex space-x-2 items-center'>
                                <p className='flex-none'>
                                    {comment.author_role}
                                </p>
                                <p className='flex-none dark:bg-default-900/30 max-sm:text-xs px-1  rounded-lg inline-block'>{comment.author_title}</p>
                            </div> : null}

                        <div className='time-div flex space-x-1'>
                            <TimeAgoWrapper lang={settings.lang.code} created={comment.created * 1000} lastUpdate={comment.last_update * 1000} />
                            {json_metadata?.app && <STooltip content={`${'Posted using'} ${json_metadata?.app}`}>
                                <p>● {json_metadata?.app?.split('/')?.[0]}</p>
                            </STooltip>}
                        </div>

                    </div>}
                    avatarProps={{
                        className: 'cursor-pointer dark:bg-default-900/30 bg-default-900/5',
                        src: getResizedAvatar(comment.author),
                        // as: 'a',
                        // onClick: () => {
                        //     navigation.push(authorLink);
                        // },


                    }}
                />
            </PopoverTrigger>
            <PopoverContent className="p-1">
                <DynamicUserCard {...props} comment={comment} />
            </PopoverContent>
        </Popover>

        <div className={clsx('absolute top-0 text-sm  right-0  text-center',
            isReply ? '' : 'px-2 mx-1 font-light rounded-full max-sm:text-xs dark:bg-default-900/30 bg-white')}>
            {isReply ? null : <STag className='' content={comment.community || (validateCommunity(comment.category) ? comment.category :
                `#${comment.category}`)} tag={comment.category} />}
        </div>
    </div>
    )
}
