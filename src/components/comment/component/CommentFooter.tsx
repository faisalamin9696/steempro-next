import { Button, Card, CardFooter, Popover, PopoverContent, PopoverTrigger } from '@nextui-org/react';
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


export default memo(function CommentFooter(props: CommentProps) {
    const { comment, className, isReply, onReplyClick, onEditClick,
        onDeleteClick, onMuteClick, compact, onPinClick, onPublishClick } = props;

    const globalData = useAppSelector(state => state.steemGlobalsReducer.value);

    const { authenticateUser, isAuthorized } = useLogin();
    const dispatch = useAppDispatch();
    const loginInfo = useAppSelector(state => state.loginReducer.value);
    const [upvotePopup, setUpvotePopup] = React.useState(false);
    const [downvotePopup, setDownvotePopup] = React.useState(false);




    function handleOnVote(open: boolean, downvote?: boolean) {
        authenticateUser();
        if (isAuthorized()) {
            if (downvote)
                setDownvotePopup(open);
            else
                setUpvotePopup(open);

        }
    }


    async function castVote(weight: number, downvote?: boolean) {
        if (downvote) {
            weight = -weight;
        }

        // check and closing the popups
        if (upvotePopup) setUpvotePopup(false);
        if (downvotePopup) setDownvotePopup(false);

        dispatch(addCommentHandler({ ...comment, status: downvote ? 'downvoting' : 'upvoting' }));
        await awaitTimeout(1);

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



        },

    });



    return <div className={clsx('flex flex-col p-1 gap-2 w-full')}>
        < Card shadow='none' className={
            clsx(`transition duration-700 ease-in-out 
        items-center dark:bg-base-300/60 shadow-md`,
                className)
        } >

            <CardFooter className={clsx("flex card-content items-center justify-between"
                , compact ? 'p-1' : 'p-2')}>
                <div className={clsx('flex', compact ? 'gap-3' : 'gap-4')}>
                    <div className='flex items-center gap-3'>
                        <div className='flex gap-1 items-center'>

                            <Popover placement='top-start' backdrop='opaque'
                                shouldCloseOnBlur={true}
                                isOpen={upvotePopup}
                                onOpenChange={(open) => handleOnVote(open)}
                            >
                                <PopoverTrigger>
                                    <Button variant='ghost' size='sm'
                                        className='border-0 
                                        rounded-full text-xl min-w-0 w-6 h-6'
                                        isLoading={comment?.status === 'upvoting'} isIconOnly>
                                        {(comment.observer_vote && comment.observer_vote_percent > 0) ?
                                            <IoChevronUpCircleSharp className={clsx('text-default-600', compact ? 'text-md' : 'text-xl')} /> :
                                            <IoChevronUpCircleOutline className={clsx('text-default-600', compact ? 'text-md' : 'text-xl')} />}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-1">
                                    <VotingModal {...props}
                                        isOpen={upvotePopup}
                                        onConfirm={castVote} />
                                </PopoverContent>
                            </Popover>
                            {comment.upvote_count ? <p className={clsx(compact && 'text-tiny')} >{comment.upvote_count}</p> : null}
                        </div>

                        <div className='flex gap-1 items-center'>
                            <Popover placement='top-start' backdrop='opaque'
                                shouldCloseOnBlur={true}
                                isOpen={downvotePopup}
                                onOpenChange={(open) => handleOnVote(open, true)} >
                                <PopoverTrigger>
                                    <Button variant='ghost' size='sm'
                                        className='border-0 rounded-full text-xl min-w-0 w-6 h-6 '
                                        isLoading={comment?.status === 'downvoting'} isIconOnly>
                                        {(comment.observer_vote && comment.observer_vote_percent < 0) ?
                                            <IoChevronDownCircleSharp className={clsx('text-default-600', compact ? 'text-md' : 'text-xl')} />
                                            : <IoChevronDownCircleOutline className={clsx('text-default-600', compact ? 'text-md' : 'text-xl')} />}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent >
                                    <VotingModal {...props}
                                        isOpen={downvotePopup}
                                        downvote onConfirm={castVote} />
                                </PopoverContent>
                            </Popover>
                            {comment.downvote_count ? <p className={clsx(compact && 'text-tiny')}>{comment.downvote_count}</p> : null}
                        </div>

                    </div>

                    <div className='flex items-center gap-2'>
                        {!compact && comment.children ?
                            <div className='flex items-center gap-1'>
                                <MdComment className={clsx('text-default-600', compact ? 'text-md' : 'text-xl')} />
                                <p className={clsx(compact && 'text-tiny', 'text-start')}>{comment.children}</p>


                            </div> : null}

                        {!isReply && comment.resteem_count ?
                            <div className='flex items-center gap-1'>
                                <SlLoop className={clsx('text-default-600', compact ? 'text-md' : 'text-xl')} />
                                <p className={clsx(compact && 'text-tiny', 'text-start')}>{comment.resteem_count}</p>

                            </div> : null}
                    </div>
                </div>

                <div className='pr-1 '>
                    {comment.payout ? <div className='flex flex-row items-center gap-1'>
                        <PiCurrencyCircleDollarFill className={clsx('text-default-600', compact ? 'text-md' : 'text-xl')} />
                        <p className={clsx(compact && 'text-tiny')}> {comment.payout?.toFixed(3)}</p>
                    </div> : null}
                </div>
            </CardFooter >

        </Card >



    </div >
})