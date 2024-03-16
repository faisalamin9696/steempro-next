import { Button, Card, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Popover, PopoverContent, PopoverTrigger, useDisclosure } from '@nextui-org/react';
import React, { memo, useState } from 'react'
import { PiCurrencyCircleDollarFill } from 'react-icons/pi';
import { SlLoop } from 'react-icons/sl';
import clsx from 'clsx';
import { useMutation } from '@tanstack/react-query';
import { calculatePowerUsage, getCredentials, getSessionKey } from '@/libs/utils/user';
import { awaitTimeout, useAppDispatch, useAppSelector } from '@/libs/constants/AppFunctions';
import { useLogin } from '@/components/useLogin';
import { addCommentHandler } from '@/libs/redux/reducers/CommentReducer';
import { toast } from 'sonner';
import { reblogPost, voteComment } from '@/libs/steem/condenser';
import { getVoteData } from '@/libs/steem/sds';
import { saveLoginHandler } from '@/libs/redux/reducers/LoginReducer';
import VotingModal from '@/components/VotingModal';
import { CommentProps } from '../CommentCard';
import { BiDownvote, BiSolidDownvote, BiSolidUpvote, BiUpvote } from "react-icons/bi";
import { abbreviateNumber } from '@/libs/utils/helper';
import { FaRegCommentAlt } from "react-icons/fa";

import { RewardBreakdownCard } from '@/components/comment/RewardBreakdownCard';
import { twMerge } from 'tailwind-merge';
import VotersCard from '@/components/VotersCard';
import './style.scss'
import ClickAwayListener from 'react-click-away-listener';

export default memo(function CommentFooter(props: CommentProps) {
    const { comment, className, isReply, onEditClick,
        onDeleteClick, onMuteClick, compact, onPinClick, onPublishClick } = props;

    const globalData = useAppSelector(state => state.steemGlobalsReducer.value);
    const { isOpen: isUpvoteOpen, onOpenChange: onUpvoteChange, onClose: onUpvoteClose } = useDisclosure();
    const { isOpen: isDownvoteOpen, onOpenChange: onDownvoteChange, onClose: onDownvoteClose } = useDisclosure();
    const [votersModal, setVotersModal] = useState(false);

    const { authenticateUser, isAuthorized } = useLogin();
    const dispatch = useAppDispatch();
    const loginInfo = useAppSelector(state => state.loginReducer.value);

    const isUpvoted = !!comment.observer_vote && comment.observer_vote_percent > 0;
    const isDownvoted = !!comment.observer_vote && comment.observer_vote_percent < 0;
    const isResteemd = !!comment.observer_resteem;

    const isVoting = comment.status === 'upvoting' || comment.status === 'downvoting';
    const [breakdownModal, setBreakdownModal] = useState(false);
    const [resteemPopup, setResteemPopup] = useState(false);
    const [upvotePopup, setUpvotePopup] = useState(false);
    const [downvotePopup, setDownvotePopup] = useState(false);


    function closeVotingModal() {
        if (upvotePopup)
            setUpvotePopup(false);
        if (downvotePopup)
            setDownvotePopup(false);
    }
    async function castVote(weight: number, downvote?: boolean) {
        closeVotingModal();

        if (downvote) {
            weight = -weight;
        }

        dispatch(addCommentHandler({ ...comment, status: downvote ? 'downvoting' : 'upvoting' }));

        await awaitTimeout(0.25);
        try {
            const credentials = getCredentials(getSessionKey());
            if (!credentials?.key) {
                toast.error('Invalid credentials');
                return
            }
            voteMutation.mutate({ key: credentials.key, weight });

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




    const reblogMutation = useMutation({
        mutationFn: (key: string) => reblogPost(loginInfo, key, {
            author: comment.author, permlink: comment.permlink,
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


    async function handleResteem() {
        authenticateUser();
        if (!isAuthorized())
            return
        const credentials = getCredentials(getSessionKey());
        if (!credentials?.key) {
            toast.error('Invalid credentials');
            return
        }

        reblogMutation.mutate(credentials.key);
    }
    const CustomCard = ({ children, className, title, onPress }: {
        children: React.ReactNode,
        className?: string,
        title?: string,
        onPress?: (event) => void
    }) => {
        return <Card title={title} isPressable={!!onPress} onPress={onPress}
            className={clsx(`dark:bg-foreground/10 flex flex-row items-center gap-1 rounded-full`,
                className)}>
            {children}
        </Card>

    }

    return <div className={twMerge('flex flex-col p-1 gap-1 w-full ', className)}>


        <div className={clsx("flex flex-row max-xs:flex-col items-center max-xs:items-start gap-2",
            !isReply && 'justify-between')}>
            <div className={clsx('flex', compact ? 'gap-3' : 'gap-4')}>
                <div className='flex flex-row items-center gap-2 relative  '>
                    {(upvotePopup || downvotePopup) && <ClickAwayListener onClickAway={closeVotingModal}>
                        <div className='absolute  animate-appearance-in z-[11] top-[-35px]'>
                            <VotingModal {...props}
                                downvote={downvotePopup}
                                onConfirm={castVote} />
                        </div>
                    </ClickAwayListener>
                    }
                    <CustomCard >

                        <Button radius='full'
                            title='Upvote'
                            variant='light'
                            onPress={() => {
                                if (!isAuthorized()) {
                                    authenticateUser();
                                    return false
                                }
                                setUpvotePopup(!upvotePopup);
                            }}
                            isDisabled={isVoting}
                            isLoading={comment.status === 'upvoting'}
                            isIconOnly size='sm'
                            className={clsx(isUpvoted && 'text-success-400')}
                        >
                            {isUpvoted ?
                                <BiSolidUpvote className={('text-lg')} /> :
                                <BiUpvote className='text-lg' />}
                        </Button>



                        {!!comment.upvote_count && <button className='text-tiny'
                            onClick={() => setVotersModal(!votersModal)}>
                            {abbreviateNumber(comment.upvote_count)}
                        </button>}

                        <Button isIconOnly size='sm'
                            variant='light'
                            title='Downvote'
                            isDisabled={isVoting}
                            isLoading={comment.status === 'downvoting'}
                            onPress={() => {
                                if (!isAuthorized()) {
                                    authenticateUser();
                                    return false
                                }
                                setDownvotePopup(!downvotePopup)
                            }}
                            className={clsx(isDownvoted && 'text-danger-400')}
                            radius='full'>
                            {isDownvoted ?
                                <BiSolidDownvote className='text-lg' /> :
                                <BiDownvote className='text-lg' />}
                        </Button>

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
                        <div>
                            <Popover isOpen={resteemPopup}

                                onOpenChange={setResteemPopup}
                                placement={'top-start'} >
                                <PopoverTrigger >
                                    <Button title='Resteem'
                                        className={twMerge('min-w-0 shadow-lg bg-white dark:bg-foreground/10 flex flex-row items-center gap-2 rounded-full',
                                            ' px-3', compact && 'px-4',
                                            isResteemd && 'text-success-400')}
                                        variant='light' radius='full'

                                        isDisabled={reblogMutation.isPending || isResteemd}
                                        isLoading={reblogMutation.isPending}

                                        size='sm'>

                                        <SlLoop className='text-lg' />

                                        {!compact && <div className='text-tiny'>
                                            {abbreviateNumber(comment.resteem_count)}
                                        </div>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent >

                                    <div className="px-1 py-2">
                                        <div className="text-small font-bold">{'Confirmation'}</div>
                                        <div className="text-tiny flex">
                                            {'Resteem this post?'}
                                        </div>

                                        <div className="text-tiny flex mt-2 space-x-2">
                                            <Button onPress={() => setResteemPopup(false)}
                                                size='sm' color='default'>No</Button>
                                            <Button size='sm' color='secondary' variant='solid'
                                                onPress={() => {
                                                    setResteemPopup(false);
                                                    if (isResteemd) {
                                                        toast.success('Already resteem');
                                                        return
                                                    }
                                                    handleResteem();
                                                }}>YES</Button>

                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    }

                </div>

            </div>

            {!!comment.payout && <CustomCard onPress={() => setBreakdownModal(!breakdownModal)}
                className='pr-2'
                title={`$${comment.payout?.toLocaleString()} Payout`}>

                <Popover placement='top' onOpenChange={setBreakdownModal} isOpen={breakdownModal}>
                    <PopoverTrigger>
                        <Button radius='full' isDisabled
                            isIconOnly size='sm' variant='light'>
                            <PiCurrencyCircleDollarFill className='text-lg' />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                        <RewardBreakdownCard comment={comment} />
                    </PopoverContent>
                </Popover>


                <div className='text-tiny'>
                    {comment.payout?.toFixed(2)}
                </div>

            </CustomCard>

            }


        </div >

        {votersModal && <Modal isOpen={votersModal} onOpenChange={setVotersModal}
            placement='top-center'
            scrollBehavior='inside'
            backdrop='blur'
            closeButton>
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">Voters</ModalHeader>
                        <ModalBody>
                            <VotersCard comment={comment} />
                        </ModalBody>
                        {/* <ModalFooter>
                            <Button color="danger" variant="light" onPress={onClose}>
                                Close
                            </Button>
                            <Button color="primary" onPress={onClose}>
                                Action
                            </Button>
                        </ModalFooter> */}
                    </>
                )}
            </ModalContent>
        </Modal>}

    </div >
})