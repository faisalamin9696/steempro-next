"use client"

import { awaitTimeout, useAppDispatch, useAppSelector } from '@/libs/constants/AppFunctions';
import { addRepliesHandler } from '@/libs/redux/reducers/RepliesReducer';
import { getPostReplies } from '@/libs/steem/sds';
import { Button } from '@nextui-org/react';
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import InfiniteScroll from 'react-infinite-scroller';
import Reply from './Reply';

interface Props {
    comment: Post | Feed;
    onReplyClick?: () => {}
}

export default function PostReplies(props: Props) {
    const { comment, onReplyClick } = props;
    const [limit, setLimit] = useState(15);
    const [isLoading, setIsLoading] = useState(false);
    const postReplies = useAppSelector(state => state.repliesReducer.values)[`${comment.author}/${comment.permlink}`] ?? [];
    const rootReplies = postReplies?.slice(0, limit)?.filter((item: Post) => item.depth === comment.depth + 1);
    const dispatch = useAppDispatch();

    const mutationKey = [`repliesMutation-${`${comment?.author}/${comment?.permlink}`}`];

    const repliesMutation = useMutation({
        mutationKey,
        mutationFn: () => getPostReplies(comment.author, comment.permlink),
        onSuccess(data) {
            setIsLoading(false);
            dispatch(addRepliesHandler({
                comment,
                replies: data?.sort((a, b) => b.created - a.created)
            }));
        }
    });

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

    return (
        <div className='p-1'>

            <div className='card card-compact mt-4 flex flex-col py-4 gap-4  dark:bg-black/80'>

                {repliesMutation?.data ? null :
                    <Button color='default' variant='flat' className='self-center' onPress={handleLoadComments}
                        isLoading={isLoading}>Load comments</Button>}

                {repliesMutation?.data?.length === 0 ?
                    <div className='flex flex-1 self-center items-center gap-1'>
                        <p>Be the first to</p>
                        <button type="button" onClick={onReplyClick}
                            data-te-ripple-init
                            data-te-ripple-color="light"
                            className="px-2 font-sans text-xs font-bold text-center 
                        text-default-900 uppercase align-middle transition-all rounded-lg select-none 
                        hover:bg-default-600/10 active:bg-default-600/20 disabled:pointer-events-none 
                        disabled:opacity-50 disabled:shadow-none">Reply</button>
                    </div> : null}
                <InfiniteScroll
                    pageStart={0}
                    loadMore={handleLoadMore}
                    hasMore={repliesMutation?.data && ((repliesMutation?.data?.length ?? 0) > limit)}
                    loader={<div className='flex justify-center items-center'>
                        <Button color='default' variant='flat' className='self-center'
                            onPress={handleLoadMore} isLoading isDisabled>Loading...</Button>
                    </div>
                    }
                >
                    {rootReplies?.map((reply: Post) => {
                        return <Reply comment={reply} rootComment={comment} />
                    })}
                </InfiniteScroll>

            </div >

        </div>
    )
}
