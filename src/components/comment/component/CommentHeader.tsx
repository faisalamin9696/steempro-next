import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Popover, PopoverContent, PopoverTrigger, User } from '@nextui-org/react'
import clsx, { ClassValue } from 'clsx'
import { FaClockRotateLeft, FaDeleteLeft, FaEllipsis, FaEllipsisVertical } from "react-icons/fa6";
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
import { FaEdit, FaEye, FaHistory, FaOptinMonster } from 'react-icons/fa';
import { Key } from 'react';
import { MdDelete } from 'react-icons/md';
import { GrAnnounce } from "react-icons/gr";
import ViewCountCard from '@/components/ViewCountCard';
import { readingTime } from '@/libs/utils/readingTime/reading-time-estimator';
import { usePathname, useRouter } from 'next/navigation';
import { query } from 'firebase/firestore';
import { Role } from '@/libs/utils/community';
import { allowDelete } from '@/libs/utils/StateFunctions';

const DynamicUserCard = dynamic(() => import('../../UserCard'));

interface Props {
    comment: Post | Feed;
    size?: 'sm' | 'md';
    className?: ClassValue;
    isReply?: boolean;
    compact?: boolean,
    handleEdit?: () => void;
}
export default function CommentHeader(props: Props) {

    const { comment, className, isReply, compact, handleEdit } = props;
    const json_metadata = JSON.parse(comment?.json_metadata ?? '{}') as { tags?: string[], image?: string[], app?: string, format?: string }
    const { data: session } = useSession();
    const username = session?.user?.name;
    const isSelf = comment.author === username;

    const canMute = username && Role.atLeast(comment.observer_role, 'mod');
    const canDelete = !comment.children && isSelf && allowDelete(comment);
    const canEdit = isSelf;
    const allowReply = Role.canComment(comment.community, comment.observer_role);
    const canReply = isReply && allowReply && comment['depth'] < 255;

    const authorLink = `/@${comment.author}/posts`;
    const settings = useAppSelector(state => state.settingsReducer.value) ?? getSettings();
    const router = useRouter();

    function handleMenuActions(key: Key) {

        if (key === 'edit') {
            handleEdit && handleEdit();
            // router.push(
            //     `/@${comment.author}/${comment.permlink}/edit`
            // );


        }

    }

    return (<div className={clsx('main-comment-list flex card-content w-auto relative items-center', className)}>


        <Popover showArrow placement="bottom">
            <PopoverTrigger>
                <User

                    classNames={{
                        description: 'mt-1 text-default-900/60 dark:text-gray-200 text-sm',
                        name: 'text-default-800'
                    }}
                    name={<div className='flex items-center gap-1'>
                        {isSelf ? <p>{comment.author}</p> :
                            <div>{comment.author}</div>
                        }
                        <Reputation reputation={comment.author_reputation} />

                        {(!isReply && !compact) ?
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button size='sm' radius='full' isIconOnly variant='light'>
                                        <FaEllipsis className='text-lg' />
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    onAction={handleMenuActions}>
                                    {<DropdownItem className={clsx(`gap-4`)}
                                        hidden={!canEdit}
                                        key={'edit'}
                                        startContent={<FaEdit className='text-lg' />} >Edit</DropdownItem>}
                                    <DropdownItem className='gap-4' key="history"
                                        startContent={<FaHistory className='text-lg' />}>Edit History</DropdownItem>
                                    <DropdownItem className='gap-4' key="promote"
                                        startContent={<GrAnnounce className='text-lg' />}>Promote</DropdownItem>

                                    <DropdownItem hidden={!canMute}
                                        key="delete" className="gap-4 text-danger" color="danger"
                                        startContent={<MdDelete className='text-lg' />}>Mute</DropdownItem>
                                        
                                    <DropdownItem hidden={!canDelete}
                                        key="delete" className="gap-4 text-danger" color="danger"
                                        startContent={<MdDelete className='text-lg' />}>Delete</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                            : null}
                    </div>}
                    description={<div className='flex flex-col'>

                        {comment.author_role && comment.author_title ?
                            <div className='flex gap-2 items-center'>
                                <p className='flex-none'>
                                    {comment.author_role}
                                </p>
                                <p className='flex-none dark:bg-default-900/30 text-tiny font-extralight px-1 rounded-lg'>{comment.author_title}</p>
                            </div> : null}

                        <div className='time-div flex sm:gap-2 max-sm:flex-col'>
                            <TimeAgoWrapper lang={settings.lang.code} created={comment.created * 1000} lastUpdate={comment.last_update * 1000} />

                            {!isReply && <div className='flex gap-1  sm:items-center'>
                                <p>in</p>

                                <STag className='text-md font-bold '
                                    content={comment.community || (validateCommunity(comment.category) ? comment.category :
                                        `#${comment.category}`)} tag={comment.category} />
                                {/* {json_metadata?.app && <STooltip content={`${'Posted using'} ${json_metadata?.app}`}>
                                <p>● {json_metadata?.app?.split('/')?.[0]}</p>
                            </STooltip>} */}
                            </div>}
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

        {<div className='absolute top-0 text-tiny right-0 items-center px-1'>
            <div className='flex flex-col items-end gap-2'>

                <div className='flex gap-2'>

                    <p className='text-tiny font-light '>
                        {comment.word_count} words,
                    </p>


                    <p className='text-tiny font-light '>
                        {readingTime('', comment.word_count).text}
                    </p>

                </div>



                <ViewCountCard comment={comment} className='shadow-sm shadow-foreground/30  rounded-full bg-white dark:border-none dark:bg-foreground/10 text-tiny px-2 py-[1px] font-light ' />

            </div>
        </div>}


    </div>
    )
}
