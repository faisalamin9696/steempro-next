import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Popover, PopoverContent, PopoverTrigger, User } from '@nextui-org/react'
import clsx, { ClassValue } from 'clsx'
import { FaEllipsis, FaEllipsisVertical } from "react-icons/fa6";
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
import { FaOptinMonster } from 'react-icons/fa';
import { Key } from 'react';
const DynamicUserCard = dynamic(() => import('../../UserCard'));

interface Props {
    comment: Post | Feed;
    size?: 'sm' | 'md';
    className?: ClassValue;
    isReply?: boolean;
    compact?: boolean
}
export default function CommentHeader(props: Props) {

    const { comment, className, isReply, compact } = props;
    const json_metadata = JSON.parse(comment?.json_metadata ?? '{}') as { tags?: string[], image?: string[], app?: string, format?: string }
    const { data: session } = useSession();
    const isSelf = comment.author === session?.user?.name;
    const authorLink = `/@${comment.author}/posts`;
    const settings = useAppSelector(state => state.settingsReducer.value) ?? getSettings();

    function handleMenuActions(key: Key) {

    }
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

                        {(!compact) ?
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button size='sm' radius='full' isIconOnly variant='light'>
                                        <FaEllipsis className='text-lg' />
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    onAction={handleMenuActions}>
                                    <DropdownItem key="new">New file</DropdownItem>
                                    <DropdownItem key="copy">Copy link</DropdownItem>
                                    <DropdownItem shortcut='⌘N' key="edit">Edit file</DropdownItem>
                                    <DropdownItem key="delete" className="text-danger" color="danger">
                                        Delete file
                                    </DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                            : null}
                    </div>}
                    description={<div className='flex flex-col'>

                        {comment.author_role && comment.author_title ?
                            <div className='flex space-x-2 items-center'>
                                <p className='flex-none'>
                                    {comment.author_role}
                                </p>
                                <p className='flex-none dark:bg-default-900/30 text-tiny px-1 rounded-lg'>{comment.author_title}</p>
                            </div> : null}

                        <div className='time-div flex gap-1'>
                            <TimeAgoWrapper lang={settings.lang.code} created={comment.created * 1000} lastUpdate={comment.last_update * 1000} />

                            {/* <p>in</p> */}

                            {/* {!isReply && <STag className='rounded-full bg-background/80 text-tiny px-2 py-[1px] font-light '
                                content={comment.community || (validateCommunity(comment.category) ? comment.category :
                                    `#${comment.category}`)} tag={comment.category} />} */}
                            {json_metadata?.app && <STooltip content={`${'Posted using'} ${json_metadata?.app}`}>
                                <p>● {json_metadata?.app?.split('/')?.[0]}</p>
                            </STooltip>}
                        </div>

                    </div>}
                    avatarProps={{
                        className: 'cursor-pointer',
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

        {<div className='absolute top-0 text-tiny right-0 items-center'>
            <div className='flex flex-row items-center gap-2'>

                {!isReply && <STag className='rounded-full bg-background/80 text-tiny px-2 py-[1px] font-light '
                    content={comment.community || (validateCommunity(comment.category) ? comment.category :
                        `#${comment.category}`)} tag={comment.category} />}

                {/* <Button size='sm' variant='light' radius='full' isIconOnly>
                    <FaEllipsisVertical className='text-lg' />
                </Button> */}

            </div>
        </div>}


    </div>
    )
}
