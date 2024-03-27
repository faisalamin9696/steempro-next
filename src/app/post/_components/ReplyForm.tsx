"use client"

import React, { memo, useState } from 'react'
import Reply from './Reply';
import { useAppSelector } from '@/libs/constants/AppFunctions';
import ReplyBody from './ReplyBody';
import ReplyFooter from './ReplyFooter';
import { twMerge } from 'tailwind-merge';

interface Props {
    comment: Post;
    rootComment: Post | Feed;
}

export default memo(function ReplyForm(props: Props) {
    const { comment, rootComment } = props;
    const commentInfo: Post = (useAppSelector(state => state.commentReducer.values)[`${comment.author}/${comment.permlink}`] ?? comment) as Post;
    const rootInfo = (useAppSelector(state => state.commentReducer.values)[`${commentInfo.root_author}/${commentInfo.root_permlink}`]) as Post;
    const postReplies = useAppSelector(state => state.repliesReducer.values)[`${rootInfo?.author}/${rootInfo?.permlink}`] ?? [];
    const [expanded, setExpanded] = useState(commentInfo.depth <= 2);
    const getReplies = permlink => {
        return postReplies?.filter((item) => item.parent_permlink === permlink)
    }

    const replies = getReplies(commentInfo.permlink);


    return (
        <div className='flex flex-col w-full gap-4'>


            <div key={commentInfo.permlink} className='flex flex-col gap-2 p-2 bg-foreground/5 w-full rounded-lg'>

                <ReplyBody comment={commentInfo}
                    rightContent={
                        commentInfo.children >= 1 &&
                        <button title={expanded ? 'Collapse' : 'Expand'}
                            className=' hover:text-primary'
                            onClick={() => setExpanded(!expanded)}>
                            [{expanded ? '-' : '+'}]
                        </button>
                    }

                />

                <ReplyFooter comment={commentInfo} expanded={expanded}
                    className='mt-4'
                    toggleExpand={() => setExpanded(!expanded)} />
            </div>

            <div className={twMerge('flex flex-col ')}
                style={{}}>
                {expanded && replies?.map((item: Post) => (

                    <Reply comment={item} rootComment={rootComment}
                       
                    />
                ))}
            </div>



        </div >

    )
}
)