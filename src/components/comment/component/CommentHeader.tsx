import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Popover, PopoverContent, PopoverTrigger, User } from '@nextui-org/react'
import clsx, { ClassValue } from 'clsx'
import { FaEllipsis } from "react-icons/fa6";
import { useAppSelector } from '@/libs/constants/AppFunctions';
import Reputation from '@/components/Reputation';
import { getResizedAvatar } from '@/libs/utils/image';
import TimeAgoWrapper from '@/components/TimeAgoWrapper';
import { validateCommunity } from '@/libs/utils/helper';
import { getSettings } from '@/libs/utils/user';
import STag from '@/components/STag';

import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { Key } from 'react';
import { MdDelete } from 'react-icons/md';
import { GrAnnounce } from "react-icons/gr";
import ViewCountCard from '@/components/ViewCountCard';
import { readingTime } from '@/libs/utils/readingTime/reading-time-estimator';
import { useRouter } from 'next/navigation';
import { Role } from '@/libs/utils/community';
import { allowDelete } from '@/libs/utils/StateFunctions';
import { MdOutlineDoNotDisturb } from "react-icons/md";
import { RiEdit2Fill } from "react-icons/ri";
import { LuHistory } from "react-icons/lu";
import { toast } from 'sonner';
import { BsClipboard2Minus } from "react-icons/bs";

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


    const menuItems = [
        { show: canEdit, key: "edit", name: "Edit", icon: RiEdit2Fill },
        { show: true, key: "history", name: "Edit History", icon: LuHistory },
        { show: false, key: "promote", name: "Promote", icon: GrAnnounce },
        { show: true, key: "copy", name: "Copy Link", icon: BsClipboard2Minus },
        { show: canMute, key: "mute", name: "Mute", icon: MdOutlineDoNotDisturb, color: 'warning' },
        { show: canDelete, key: "delete", name: "Delete", icon: MdDelete, color: 'danger' },

    ]
    const renderedItems = menuItems
        .filter(item => item.show)
        .map(item => <DropdownItem key={item.key}
            color={item.color as any || 'default'}
            startContent={<item.icon className={'text-lg'} />}>{item.name}</DropdownItem>);

    function handleMenuActions(key: Key) {
        switch (key) {
            case 'edit':
                handleEdit && handleEdit();
                break;

            case 'copy':
                navigator.clipboard.writeText(window.location.href);
                toast.success('Copied');
                break;


        }


        if (key === 'edit') {


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
                                    onAction={handleMenuActions} hideEmptyContent>
                                    {renderedItems}
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
                                <p className='flex-none dark:bg-default-900/30 text-tiny font-light px-1 rounded-lg'>{comment.author_title}</p>
                            </div> : null}

                        <div className={clsx(`time-div flex`, compact ? 'gap-0' : 'max-sm:flex-col sm:gap-2')}>
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

        {!isReply && !compact && <div className='absolute top-0 text-tiny right-0 items-center px-1'>
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
