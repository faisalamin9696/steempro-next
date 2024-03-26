import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, } from '@nextui-org/dropdown';
import { User } from '@nextui-org/user';
import { Button } from '@nextui-org/button';
import { Popover, PopoverContent, PopoverTrigger, } from '@nextui-org/popover';
import clsx, { ClassValue } from 'clsx'
import { FaEllipsis } from "react-icons/fa6";
import { useAppDispatch, useAppSelector } from '@/libs/constants/AppFunctions';
import Reputation from '@/components/Reputation';
import { getResizedAvatar } from '@/libs/utils/image';
import TimeAgoWrapper from '@/components/wrapper/TimeAgoWrapper';
import { validateCommunity } from '@/libs/utils/helper';
import { getCredentials, getSessionKey, getSettings } from '@/libs/utils/user';
import STag from '@/components/STag';

import { Key, memo, useState } from 'react';
import { MdDelete } from 'react-icons/md';
import { GrAnnounce } from "react-icons/gr";
import ViewCountCard from '@/components/ViewCountCard';
import { readingTime } from '@/libs/utils/readingTime/reading-time-estimator';
import { Role } from '@/libs/utils/community';
import { allowDelete } from '@/libs/utils/StateFunctions';
import { MdOutlineDoNotDisturb } from "react-icons/md";
import { RiEdit2Fill } from "react-icons/ri";
import { LuHistory } from "react-icons/lu";
import { toast } from 'sonner';
import { BsClipboard2Minus } from "react-icons/bs";
import EditRoleModal from '@/components/EditRoleModal';
import { FaInfoCircle } from 'react-icons/fa';
import MuteDeleteModal from '@/components/MuteDeleteModal';
import { useMutation } from '@tanstack/react-query';
import { mutePost, pinPost } from '@/libs/steem/condenser';
import { addCommentHandler } from '@/libs/redux/reducers/CommentReducer';
import { useLogin } from '@/components/useLogin';
import Link from 'next/link';
import { BsPinAngleFill } from "react-icons/bs";
import RoleTitleCard from '@/components/RoleTitleCard';


interface Props {
    comment: Post | Feed;
    size?: 'sm' | 'md';
    className?: ClassValue;
    isReply?: boolean;
    compact?: boolean,
    handleEdit?: () => void;
    isDetail?: boolean;
}
export default memo(function CommentHeader(props: Props) {

    const { comment, className, isReply, compact, handleEdit, isDetail } = props;
    const loginInfo = useAppSelector(state => state.loginReducer.value);
    const dispatch = useAppDispatch();
    const username = loginInfo.name;
    const isSelf = !!loginInfo.name && (loginInfo.name === (comment.author));

    const canMute = username && Role.atLeast(comment.observer_role, 'mod');
    const canDelete = !comment.children && isSelf && allowDelete(comment);
    const canEdit = isSelf;
    const allowReply = Role.canComment(comment.community, comment.observer_role);
    const canReply = isReply && allowReply && comment['depth'] < 255;
    const settings = useAppSelector(state => state.settingsReducer.value) ?? getSettings();
    const [isRoleOpen, setIsRoleOpen] = useState(false);
    const { authenticateUser, isAuthorized } = useLogin();

    const [confirmationModal, setConfirmationModal] = useState<{
        isOpen: boolean, mute?: boolean, muteNote?: string
    }>({
        isOpen: false,
        mute: false,
        muteNote: ''
    });


    const menuItems = [
        { show: canEdit, key: "edit", name: "Edit", icon: RiEdit2Fill },
        { show: canDelete, key: "delete", name: "Delete", icon: MdDelete, color: 'danger' },
        { show: Role.atLeast(comment?.observer_role, 'mod'), key: "role", name: "Edit Role/Title", icon: LuHistory },
        { show: canMute, key: "mute", name: comment.is_muted ? 'Unmute' : "Mute", icon: MdOutlineDoNotDisturb, color: 'warning' },
        { show: canMute, key: "pin", name: comment.is_pinned ? 'Unpin' : "Pin", icon: BsPinAngleFill },
        { show: true, key: "copy", name: "Copy Link", icon: BsClipboard2Minus },
        { show: false, key: "promote", name: "Promote", icon: GrAnnounce },
        { show: false, key: "history", name: "Edit History", icon: LuHistory },


    ]
    const renderedItems = menuItems
        .filter(item => item.show)
        .map(item => <DropdownItem key={item.key}
            color={item.color as any || 'default'}
            startContent={<item.icon className={'text-lg'} />}>{item.name}</DropdownItem>);

    const unmuteMutation = useMutation({
        mutationFn: (key: string) => mutePost(loginInfo, key, !!!comment.is_muted, {
            community: comment.category, account: comment.author, permlink: comment.permlink,
        }),
        onSettled(data, error, variables, context) {
            if (error) {
                toast.error(error.message);
                return;
            }
            dispatch(addCommentHandler({ ...comment, is_muted: 0 }));
            toast.success(`Unmuted`);

        },
    });

    const pinMutation = useMutation({
        mutationFn: (key: string) => pinPost(loginInfo, key, !!!comment.is_pinned, {
            community: comment.category, account: comment.author, permlink: comment.permlink,
        }),
        onSettled(data, error, variables, context) {
            if (error) {
                toast.error(error.message);
                return;
            }
            dispatch(addCommentHandler({ ...comment, is_pinned: comment.is_pinned ? 0 : 1 }));
            toast.success(!!!comment.is_pinned ? 'Pinned' : 'Unpinned')

        },
    });


    const isPending = pinMutation.isPending || unmuteMutation.isPending;

    async function handleMenuActions(key: Key) {
        switch (key) {
            case 'edit':
                handleEdit && handleEdit();
                break;

            case 'copy':
                navigator.clipboard.writeText(window.location.href);
                toast.success('Copied');
                break;
            case 'role':
                setIsRoleOpen(!isRoleOpen);
                break;
            case 'delete':
                setConfirmationModal({ isOpen: true });
                break;

            case 'mute':
            case 'pin':
                authenticateUser();
                if (!isAuthorized())
                    return
                const credentials = getCredentials(getSessionKey());
                if (!credentials?.key) {
                    toast.error('Invalid credentials');
                    return
                }
                if (key === 'mute') {// mute option will trigger the modal that's why only mute check
                    if (comment.is_muted === 1) {
                        unmuteMutation.mutate(credentials.key);
                        return
                    }

                    // trigger for mute
                    setConfirmationModal({ isOpen: true, mute: true });
                    return
                }
                if (key === 'pin')
                    pinMutation.mutate(credentials.key);
                break;

        }

    }

    const ExtraInformation = ({ className }: { className?: string }) => {
        return <div className={clsx('flex flex-col items-end gap-2', className)}>

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

    }
    return (<div className={clsx('main-comment-list flex card-content w-auto relative items-center', className)}>

        <User
            classNames={{
                description: 'text-default-900/60 dark:text-gray-200 text-sm',
                name: 'text-default-800'
            }}
            name={<div className='flex items-center gap-1'>
                {isSelf ? <p>{comment.author}</p> :
                    <div>{comment.author}</div>
                }
                <Reputation reputation={comment.author_reputation} />

                {!compact && !!comment.is_pinned && <p className='px-1 rounded-sm text-tiny bg-primary-100 dark:bg-primary'>Pinned</p>}

                {(!isReply && !compact) ?
                    <Dropdown>
                        <DropdownTrigger>
                            <Button size='sm' radius='full'
                                isLoading={isPending}
                                isDisabled={isPending}
                                isIconOnly variant='light'>
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

                {isDetail && <RoleTitleCard comment={comment} />}

                <div className={clsx(`time-div flex gap-2`,)}>
                    <Link className={clsx(isReply ? '' : 'pointer-events-none')} href={isReply ? `/${comment.category}/@${comment.author}/${comment.permlink}` : ''}>
                        <TimeAgoWrapper lang={settings.lang.code} created={comment.created * 1000} lastUpdate={comment.last_update * 1000} />
                    </Link>
                    {!isReply && <div className='flex gap-1  sm:items-center'>
                        <p className={''}>in</p>

                        <STag className='text-md font-bold '
                            content={comment.community || (validateCommunity(comment.category) ? comment.category :
                                `#${comment.category}`)} tag={comment.category} />

                    </div>}
                </div>

            </div>}
            avatarProps={{
                className: clsx(isReply ? 'h-8 w-8' : '', 'cursor-pointer '),
                src: getResizedAvatar(comment.author),
                as: Link,

                href: `/@${comment.author}`
            } as any}
        />
        {!isReply && !compact && comment.depth === 0 &&
            <div className='absolute top-0 text-tiny right-0 items-center px-1'>
                <Popover className='hidden max-sm:block' placement="bottom" showArrow offset={10}>
                    <PopoverTrigger className='absolute top-0 text-tiny right-0 items-center px-1'>
                        <Button isIconOnly radius='full'
                            className='hidden max-sm:block'
                            size='sm' variant='light'
                            color="default">
                            <FaInfoCircle className='text-lg text-default-800' />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                        <ExtraInformation />
                    </PopoverContent>
                </Popover>
                <ExtraInformation className='block max-sm:hidden' />
            </div>}


        {/* <Popover showArrow placement="bottom">
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
                               
                            </div>}
                        </div>

                    </div>}
                    avatarProps={{
                        className: 'cursor-pointer',
                        src: getResizedAvatar(comment.author),
                        as: 'a',
                        onClick: () => {
                            router.push(authorLink);
                        },


                    }}
                />
            </PopoverTrigger>
            <PopoverContent className="p-1">
                <DynamicUserCard username={comment.author} />
            </PopoverContent>
        </Popover> */}



        {isRoleOpen && <EditRoleModal comment={comment} isOpen={isRoleOpen}
            onOpenChange={setIsRoleOpen} />}

        {confirmationModal.isOpen && <MuteDeleteModal
            comment={comment}
            isOpen={confirmationModal.isOpen} onOpenChange={(isOpen) => setConfirmationModal({ ...confirmationModal, isOpen: isOpen })}
            mute={confirmationModal.mute}
            muteNote={confirmationModal.muteNote}
            onNoteChange={(value) => { setConfirmationModal({ ...confirmationModal, muteNote: value }); }}
        />
        }
    </div>
    )
})
