import { Button, Card, CardFooter, Popover, PopoverContent, PopoverTrigger, useDisclosure } from '@nextui-org/react';
import React, { memo } from 'react'
import { IoChevronUpCircleSharp, IoChevronDownCircleOutline, IoChevronUpCircleOutline, IoChevronDownCircleSharp } from 'react-icons/io5';
import { MdComment } from 'react-icons/md';
import { PiCurrencyCircleDollarFill } from 'react-icons/pi';
import { SlLoop } from 'react-icons/sl';
import clsx, { ClassValue } from 'clsx';
import { useMutation } from '@tanstack/react-query';
import { calculatePowerUsage, getCredentials, getSessionKey } from '@/libs/utils/user';
import { awaitTimeout, useAppDispatch, useAppSelector } from '@/libs/constants/AppFunctions';
import { useLogin } from '@/components/useLogin';
import { addCommentHandler } from '@/libs/redux/reducers/CommentReducer';
import { toast } from 'sonner';
import { voteComment } from '@/libs/steem/condenser';
import { getVoteData } from '@/libs/steem/sds';
import { saveLoginHandler } from '@/libs/redux/reducers/LoginReducer';
import VotingModal from '@/components/VotingModal';
import IconButton from '@/components/IconButton';
import { CommentProps } from '../CommentCard';
import { BiDownvote, BiSolidDownvote, BiSolidUpvote, BiUpvote } from "react-icons/bi";
import { abbreviateNumber } from '@/libs/utils/helper';
import { FaRegCommentAlt } from "react-icons/fa";

import { ImLoop } from "react-icons/im";

export default memo(function CommentFooter(props: CommentProps) {
    const { comment, className, isReply, onReplyClick, onEditClick,
        onDeleteClick, onMuteClick, compact, onPinClick, onPublishClick } = props;

    const globalData = useAppSelector(state => state.steemGlobalsReducer.value);
    const { isOpen: isUpvoteOpen, onOpenChange: onUpvoteChange, onClose: onUpvoteClose } = useDisclosure();
    const { isOpen: isDownvoteOpen, onOpenChange: onDownvoteChange, onClose: onDownvoteClose } = useDisclosure();

    const { authenticateUser, isAuthorized } = useLogin();
    const dispatch = useAppDispatch();
    const loginInfo = useAppSelector(state => state.loginReducer.value);
    const isUpvoted = comment.observer_vote === 1 && comment.observer_vote_percent > 0;
    const isDownvoted = comment.observer_vote === 1 && comment.observer_vote_percent < 0;
    const isVoting = comment.status === 'upvoting' || comment.status === 'downvoting';




    function handleOnVote(open: boolean, downvote?: boolean) {


    }


    async function castVote(weight: number, downvote?: boolean) {
        if (downvote) {
            weight = -weight;
        }

        dispatch(addCommentHandler({ ...comment, status: downvote ? 'downvoting' : 'upvoting' }));

        await awaitTimeout(0.25);
        try {
            const credentials = getCredentials(getSessionKey());
            if (credentials?.key) {
                await voteMutation.mutateAsync({ key: credentials.key, weight });
            } else {
                toast.error('Invalid credentials');
            }
        }
        catch (err) {
            toast.error(String(err));
        }


    }



    const voteMutation = useMutation({
        mutationFn: ({ key, weight }: { key: string, weight: number }) =>
            voteComment(loginInfo, comment, key, weight),
        onSettled(data, error, variables, context) {
            const { weight } = variables;
            if (error) {
                toast.error(String(error));
                dispatch(addCommentHandler({ ...comment, status: 'idle' }));
                return
            }

            const downvote = weight < 0;
            const vData = getVoteData(loginInfo, globalData);
            const remove = weight === 0;

            const vote_value = ((weight / 100) * ((vData.current_vote * (downvote ? loginInfo.downvote_mana_percent :
                loginInfo.upvote_mana_percent) * 0.01)));

            const newChanges: Post | Feed = {
                ...comment,
                observer_vote: remove ? 0 : 1,
                [downvote ? 'downvote_count' : 'upvote_count']: downvote ? comment.downvote_count + 1 : comment.upvote_count + 1
                , observer_vote_percent: weight,
                payout: remove ? comment.payout : (comment.payout + (downvote ? -vote_value : vote_value))
                , observer_vote_rshares: remove ? 0 : comment.observer_vote_rshares,
                status: 'idle'
            }


            dispatch(addCommentHandler(newChanges));


            // update the login user data
            const downvote_per = downvote ? loginInfo.downvote_mana_percent - calculatePowerUsage(weight) : loginInfo.downvote_mana_percent;
            const upvote_per = !downvote ? loginInfo.upvote_mana_percent - calculatePowerUsage(weight) : loginInfo.upvote_mana_percent;
            dispatch(saveLoginHandler({ ...loginInfo, upvote_mana_percent: upvote_per, downvote_mana_percent: downvote_per }))

            if (variables.weight < 0) {
                onDownvoteClose();
                return
            }
            onUpvoteClose();



        },

    });


    const CustomCard = ({ children, className, title }: {
        children: React.ReactNode,
        className?: string,
        title?: string
    }) => {
        return <Card title={title}
            className={clsx(`dark:bg-foreground/10 flex flex-row items-center gap-1 rounded-full`,
                className)}>
            {children}
        </Card>

    }

    return <div className={clsx('flex flex-col p-1 gap-1 w-full')}>


        <div className={clsx("flex flex-row max-sm:flex-col items-center max-sm:items-start gap-2",
            !isReply && 'justify-between')}>
            <div className={clsx('flex', compact ? 'gap-3' : 'gap-4')}>
                <div className='flex flex-row items-center gap-2'>
                    <CustomCard>
                        <Popover placement='top-start'
                            backdrop='opaque'
                            onOpenChange={() => {
                                if (!isAuthorized()) {
                                    authenticateUser();
                                    return false
                                }
                            }}
                            shouldCloseOnBlur={true}>
                            <PopoverTrigger>
                                <Button radius='full'
                                    title='Upvote'
                                    variant='light'
                                    isDisabled={isVoting}
                                    isLoading={comment.status === 'upvoting'}
                                    isIconOnly size='sm'
                                    className={clsx(isUpvoted && 'text-success-400')}
                                >
                                    {isUpvoted ?
                                        <BiSolidUpvote className={('text-lg')} /> :
                                        <BiUpvote className='text-lg' />}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-1">
                                <VotingModal {...props}
                                    onConfirm={castVote} />
                            </PopoverContent>
                        </Popover>


                        {!!comment.upvote_count && <div className='text-tiny'>
                            {abbreviateNumber(comment.upvote_count)}
                        </div>}


                        <Popover placement='top-start' backdrop='opaque'
                            shouldCloseOnBlur={true}
                        >
                            <PopoverTrigger>
                                <Button isIconOnly size='sm'
                                    variant='light'
                                    title='Downvote'
                                    isDisabled={isVoting}
                                    isLoading={comment.status === 'downvoting'}
                                    className={clsx(isDownvoted && 'text-danger-400')}
                                    radius='full'>
                                    {isDownvoted ?
                                        <BiSolidDownvote className='text-lg' /> :
                                        <BiDownvote className='text-lg' />}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-1">
                                <VotingModal {...props}
                                    downvote
                                    onConfirm={castVote} />
                            </PopoverContent>
                        </Popover>

                        {/* {!!comment.downvote_count && <div className='text-tiny pr-2'>
                                {abbreviateNumber(comment.downvote_count)}
                            </div>} */}
                    </CustomCard>

                    {!compact && !!comment.children && <CustomCard className='px-3'
                        title={`${comment.children} Comments`}>

                        <Button radius='full' isIconOnly size='sm'
                            variant='light'>
                            <FaRegCommentAlt className='text-lg' />
                        </Button>



                        {<div className='text-tiny'>
                            {abbreviateNumber(comment.children)}
                        </div>}
                    </CustomCard>
                    }

                    {!isReply && !!comment.resteem_count &&
                        <CustomCard className='px-3' title={`${comment.resteem_count} Reblogs`}>

                            <Button variant='light' radius='full' isIconOnly size='sm'>
                                <SlLoop className='text-lg' />
                            </Button>

                            <div className='text-tiny'>
                                {abbreviateNumber(comment.resteem_count)}
                            </div>
                        </CustomCard>}

                </div>

            </div>

            {!!comment.payout && <CustomCard
                className='pr-2'
                title={`$${comment.payout?.toString()} Payout`}>

                <Button radius='full'
                    isIconOnly size='sm' variant='light'>
                    <PiCurrencyCircleDollarFill className='text-lg' />
                </Button>


                <div className='text-tiny'>
                    {comment.payout?.toFixed(2)}
                </div>

            </CustomCard>
            }


        </div >

    </div >
})