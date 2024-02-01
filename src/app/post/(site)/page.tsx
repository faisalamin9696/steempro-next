
"use client"

import MarkdownViewer from '@/components/body/MarkdownViewer';
import CommentFooter from '@/components/comment/component/CommentFooter';
import CommentHeader from '@/components/comment/component/CommentHeader';
import { useAppDispatch, useAppSelector } from '@/libs/constants/AppFunctions';
import { addCommentHandler } from '@/libs/redux/reducers/CommentReducer';
import { getSettings } from '@/libs/utils/user';
import { Card, CardFooter } from '@nextui-org/react';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
const DynamicPostReplies = dynamic(() => import('../_components/PostReplies'))


type Props = {
    data: Post;
}

export default function PostPage(props: Props) {
    const { data } = props;

    // const { category, username: author, permlink } = getPathnameClient(null, location.pathname);
    const dispatch = useAppDispatch();
    // const queryKey = [`post-${author}-${permlink}`];
    const commentInfo = useAppSelector(state => state.commentReducer.values)[`${data.author}/${data.permlink}`] ?? data;
    const settings = useAppSelector(state => state.settingsReducer.value) ?? getSettings();


    useEffect(() => {
        dispatch(addCommentHandler(data));
    }, []);

    return (<div className='flex-col gap-4'>
        {commentInfo ?
            <div className='card w-full dark:bg-default-900/30 
        card-compact bg-default-900/5 shadow-sm'>
                <div className="p-4 space-y-4 flex-col">
                    <>
                        <CommentHeader size='md' comment={commentInfo} className='w-full' />
                    </>
                    <h2 className="text-xl font-bold text-black dark:text-white">{commentInfo.title}</h2>

                </div>
                <div className='flex flex-col px-1 items-center'>
                    <Card shadow='none'
                        className='w-full gap-4 px-2 max-w-[640px]'>

                        <MarkdownViewer text={commentInfo.body} />


                        <CardFooter className='w-full'>
                            <CommentFooter comment={commentInfo} className={'w-full'} />
                        </CardFooter>
                    </Card>
                </div>

                <DynamicPostReplies comment={commentInfo} />

            </div> : null}
    </div>
    )
}
