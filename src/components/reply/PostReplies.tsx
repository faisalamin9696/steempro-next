"use client"

import { awaitTimeout, useAppDispatch, useAppSelector } from '@/libs/constants/AppFunctions';
import { addRepliesHandler } from '@/libs/redux/reducers/RepliesReducer';
import { getPostReplies } from '@/libs/steem/sds';
import { Button } from '@nextui-org/button';
import { Card } from '@nextui-org/card';
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import InfiniteScroll from "react-infinite-scroll-component";
import Reply from './Reply';
import MarkdownViewer from '@/components/body/MarkdownViewer';
import EditorInput from '@/components/editor/EditorInput';
import ClearFormButton from '@/components/editor/components/ClearFormButton';
import PublishButton from '@/components/editor/components/PublishButton';
import moment from 'moment';
import { toast } from 'sonner';
import { addCommentHandler } from '@/libs/redux/reducers/CommentReducer';
import { publishContent } from '@/libs/steem/condenser';
import { validateCommentBody, generateReplyPermlink, makeJsonMetadataReply } from '@/libs/utils/editor';
import { getCredentials, getSessionKey } from '@/libs/utils/user';
import { useLogin } from '@/components/AuthProvider';
import secureLocalStorage from 'react-secure-storage';
import { readingTime } from '@/libs/utils/readingTime/reading-time-estimator';
import EmptyList from '@/components/EmptyList';
import { Select, SelectItem } from '@nextui-org/select';
import { useSession } from 'next-auth/react';

interface Props {
    comment: Post | Feed;
    onReplyClick?: () => {}
}

export default memo(function PostReplies(props: Props) {
    const { comment } = props;

    const commentInfo: Post = (useAppSelector(state => state.commentReducer.values)[`${comment.author}/${comment.permlink}`] ?? comment) as Post;
    const postReplies = useAppSelector(state => state.repliesReducer.values)[`${commentInfo.author}/${commentInfo.permlink}`] ?? [];
    const loginInfo = useAppSelector(state => state.loginReducer.value);

    const [limit, setLimit] = useState(15);
    const rootReplies = postReplies?.slice(0, limit)?.filter((item: Post) => item.depth === commentInfo.depth + 1);

    const dispatch = useAppDispatch();

    const queryKey = [`post-${commentInfo.author}-${commentInfo.permlink}`];
    const queryClient = useQueryClient();
    const mutationKey = [`repliesMutation-${`${commentInfo?.author}/${commentInfo?.permlink}`}`];
    const [sorting, setSorting] = useState<'created' | 'payout' | 'upvote_count'>('payout');
    const { users } = JSON.parse(commentInfo.json_metadata ?? `{}`) || [];


    const [isLoading, setIsLoading] = useState(false);
    const [markdown, setMarkdown] = useState('');
    const rpm = readingTime(markdown);

    const [showReply, setShowReply] = useState(false);
    const [isPosting, setPosting] = useState(false);
    const { authenticateUser, isAuthorized } = useLogin();
    const { data: session } = useSession();

    const editorDiv = useRef<any>(null);


    const repliesMutation = useMutation({
        mutationKey,
        mutationFn: () => getPostReplies(commentInfo.author, commentInfo.permlink, loginInfo.name),
        onSuccess(data) {
            setIsLoading(false);
            dispatch(addRepliesHandler({
                comment: commentInfo,
                replies: data?.sort((a, b) => b[sorting as string] - a[sorting as string])
            }));
        }
    });

    useEffect(() => {
        if (showReply) {
            editorDiv?.current?.focus();
        }
    }, [showReply]);


    const toggleReply = () => setShowReply(!showReply);

    function handleLoadComments() {
        setIsLoading(true);
        repliesMutation.mutate();

    }


    async function handleLoadMore() {
        setIsLoading(true);
        await awaitTimeout(1.5);
        setLimit((prev) => prev + 20);
        setIsLoading(false);

    }



    function clearForm() {
        setMarkdown('');
    }



    function handleClear() {
        secureLocalStorage.removeItem('comment_draft');
        setMarkdown('');

    }


    function handleOnPublished(postData: PostingContent) {
        const time = moment().unix();

        let newComment: Post = {
            ...commentInfo,
            link_id: time,
            created: time,
            last_update: time,

            ...postData,
            json_metadata: JSON.stringify(postData.json_metadata),
            body: postData.body,
            author: loginInfo.name,
            depth: commentInfo.depth + 1,
            payout: 0,
            upvote_count: 0,
            observer_vote: 0,
            category: commentInfo.category,
            author_reputation: loginInfo.reputation,
            author_role: commentInfo?.observer_role ?? '',
            author_title: commentInfo?.observer_title ?? '',
            observer_title: commentInfo?.observer_title ?? '',
            observer_role: commentInfo?.observer_role ?? '',
            root_author: commentInfo.author,
            root_permlink: commentInfo.permlink,
            root_title: commentInfo.root_title,
            net_rshares: 0,
            children: 0,
            observer_vote_percent: 0,
            resteem_count: 0,
            observer_resteem: 0,
            replies: [],
            votes: [],
            downvote_count: 0,
            cashout_time: moment().add(7, 'days').unix(),
            is_new: 1
        }

        queryClient.setQueryData(queryKey, { ...commentInfo, children: commentInfo?.children + 1 })

        // update the redux state for the post
        dispatch(addCommentHandler({ ...commentInfo, children: commentInfo?.children + 1 }));

        // update the redux state for the current comment
        // dispatch(addCommentHandler({ ...commentInfo, children: commentInfo?.children + 1 }));

        // update the redux state for the root post replies
        dispatch(addRepliesHandler({
            comment: commentInfo,
            replies: [newComment].concat(postReplies)
        }));

        handleClear();
        clearForm();
        toggleReply();
        toast.success('Sent');
        setPosting(false);
    }


    const postingMutation = useMutation({
        mutationKey: [`publish-reply`],
        mutationFn: ({ postData, options, key }:
            { postData: PostingContent, options?: any, key: string }) =>
            publishContent(postData, options, key),
        onSettled(data, error, variables, context) {
            if (error) {
                toast.error(error.message);
                return
            }
            const { postData } = variables;
            handleOnPublished(postData);
            setPosting(false);

        },
    });


    async function handlePublish() {

        if (!markdown) {
            toast.info('Comment can not be empty');
            return
        }

        const limit_check = validateCommentBody(markdown, false);
        if (limit_check !== true) {
            toast.info(limit_check);
            return;
        }


        authenticateUser();
        if (!isAuthorized())
            return
        const credentials = getCredentials(getSessionKey(session?.user?.name));
        if (!credentials?.key) {
            toast.error('Invalid credentials');
            return
        }

        setPosting(true);
        await awaitTimeout(0.5);

        try {


            // generating the permlink for the comment author
            let permlink = generateReplyPermlink(commentInfo.author);

            const postData: PostingContent = {
                author: loginInfo,
                title: '',
                body: markdown,
                parent_author: commentInfo.author,
                parent_permlink: commentInfo.permlink,
                json_metadata: makeJsonMetadataReply(),
                permlink: permlink

            }

            postingMutation.mutate({ postData, options: null, key: credentials.key });



        } catch (e) {
            toast.error(String(e));
            setPosting(false);
        }


    }


    return (
        <div id='post-replies'>

            <div className='flex justify-between items-center gap-2 px-2'>

                <Button size='sm' variant='flat'
                    color='secondary'
                    radius='full'
                    onClick={toggleReply}
                    isDisabled={showReply}
                    className='text-tiny min-h-0'>
                    Reply
                </Button>

                <div>
                    {repliesMutation.isSuccess && <div className='w-36 items-center'>
                        <Select
                            radius='full'
                            variant='flat'
                            color='default'
                            size='sm'
                            label="Sort"
                            selectedKeys={[sorting]}
                            labelPlacement='outside-left'
                            classNames={{ base: 'items-center' }}
                            selectionMode='single'
                            onChange={(key) => {
                                setSorting(key.target.value as any);
                                repliesMutation.mutate();
                            }}

                        >

                            <SelectItem key={'created'} value={'created'}>
                                Age
                            </SelectItem>

                            <SelectItem key={'payout'} value={'payout'}>
                                Trending
                            </SelectItem>

                            <SelectItem key={'upvote_count'} value={'upvote_count'}>
                                Votes
                            </SelectItem>

                        </Select>
                    </div>}
                </div>



            </div>

            <div className=' mt-4 flex flex-col py-4 gap-4' >

                {repliesMutation.isSuccess ? null :
                    <div className='flex flex-row gap-2 items-center justify-center'>

                        <Button color='default' variant='flat'
                            isDisabled={repliesMutation.isPending}

                            className='self-center'
                            onClick={handleLoadComments}
                            isLoading={isLoading || repliesMutation.isPending}>Load comments</Button>

                    </div>}

                <div ref={editorDiv} tabIndex={-1} className='focus:border-0 focus:ring-0 focus:outline-none' >

                    {showReply &&
                        <div className='flex flex-col mt-2 gap-2 animate-appearance-in' >
                            <EditorInput
                                value={markdown}
                                users={[commentInfo.author, commentInfo.parent_author, commentInfo.root_author, ...(users ?? [])]}
                                onChange={setMarkdown}
                                onImageUpload={() => { }}
                                onImageInvalid={() => { }}
                                rows={6} />

                            <div className='flex justify-between'>
                                <ClearFormButton
                                    onClearPress={handleClear} />

                                <div className='flex gap-2 '>

                                    {<Button radius='full'
                                        size='sm'
                                        onClick={() => {

                                            toggleReply();

                                        }}>
                                        Cancel
                                    </Button>}

                                    <PublishButton
                                        isDisabled={isPosting}
                                        onClick={handlePublish}
                                        isLoading={isPosting}
                                        tooltip=''
                                        buttonText={'Send'} />
                                </div>




                            </div>

                            <div className='space-y-1 w-full overflow-auto p-1 m-1 mt-4'>

                                <div className=' items-center flex justify-between'>
                                    <p className='float-left text-sm text-default-900/70 font-semibold'>Preview</p>

                                    <p className='float-right text-sm font-light text-default-900/60'>{rpm?.words} words, {rpm?.text}</p>

                                </div>
                                {markdown ? <Card shadow='sm' className='p-2 lg:shadow-none space-y-2'>
                                    <MarkdownViewer text={markdown} />
                                </Card> : null}
                            </div>

                        </div>}
                </div>
                <InfiniteScroll

                    dataLength={limit}
                    next={handleLoadMore}
                    hasMore={((repliesMutation?.data?.length ?? 0) > limit)}
                    loader={<div className='flex justify-center items-center'>
                        <Button color='default' variant='flat' className='self-center'
                            onClick={handleLoadMore} isLoading isDisabled>Loading...</Button>
                    </div>}
                    endMessage={
                        repliesMutation.isSuccess && <EmptyList />
                    }
                >
                    <div className='flex flex-col '>


                        {rootReplies?.map((reply: Post) => {
                            return (!reply.link_id) ? null :
                                <div>
                                    < Reply key={reply.link_id}
                                        comment={reply}
                                        rootComment={commentInfo} />

                                </div>
                        })}
                    </div>
                </InfiniteScroll>

            </div >

        </div >
    )
})
