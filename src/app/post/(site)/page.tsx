
"use client"

import MarkdownViewer from '@/components/body/MarkdownViewer';
import CommentFooter from '@/components/comment/component/CommentFooter';
import CommentHeader from '@/components/comment/component/CommentHeader';
import { useAppDispatch, useAppSelector } from '@/libs/constants/AppFunctions';
import { addCommentHandler } from '@/libs/redux/reducers/CommentReducer';
import { getSettings } from '@/libs/utils/user';
import { Card, CardFooter } from '@nextui-org/react';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import usePathnameClient from '@/libs/utils/usePathnameClient';
import { updatePostView } from '@/libs/firebase/firebaseApp';
import { getAuth } from 'firebase/auth';
import SubmitPage from '@/app/submit/(site)/page';
import clsx from 'clsx';
import { useRouter } from 'next13-progressbar';
import { ViewCountTime } from '@/libs/constants/AppConstants';
import Link from 'next/link';
const DynamicPostReplies = dynamic(() => import('../_components/PostReplies'))


interface Props {
    data: Post;
}

export default function PostPage(props: Props) {
    const { data } = props;
    const pathname = usePathname();
    const { category } = usePathnameClient();
    // const { category, username: author, permlink } = getPathnameClient(null, location.pathname);
    const dispatch = useAppDispatch();
    // const queryKey = [`post-${author}-${permlink}`];
    const commentInfo: Post = useAppSelector(state => state.commentReducer.values)[`${data.author}/${data.permlink}`] ?? data;
    const [editMode, setEditMode] = useState(false);
    const toggleEditMode = () => setEditMode(!editMode)

    const router = useRouter();

    useEffect(() => {
        router.refresh();
    }, [pathname]);



    useEffect(() => {
        if (!category && data) {
            window.history.replaceState({}, '', `/${data.category}/@${data?.author}/${data?.permlink}`)
        }
        dispatch(addCommentHandler(data));

    }, []);


    useEffect(() => {

        // count view after ViewCountTime mili seconds
        const timeout = setTimeout(() => {
            if (commentInfo.depth === 0)
                updatePostView(data);
        }, ViewCountTime);

        return () => clearTimeout(timeout);
    }, []);


    if (editMode) {
        return <SubmitPage params={{
            oldPost: data,
            handleUpdateCancel: toggleEditMode,
            handleUpdateSuccess: (post) => {
                dispatch(addCommentHandler(post));
                toggleEditMode();
            }
        }} />
    }

    if (commentInfo && !commentInfo.link_id) {
        return <p>post/comment not found</p>
    }

    return (<div key={pathname}
        className='flex-col bg-white dark:bg-white/5
    backdrop-blur-md rounded-lg p-4 w-full mb-10'>
        {commentInfo ?
            <div className='card w-full card-compact shadow-sm  gap-4'>

                {!!commentInfo.depth &&
                    <Card className='flex flex-col p-4 gap-2'>
                        <p className='text-tiny'>You are viewing a single comment's thread from:</p>
                        <p className='text-medium'>RE: {commentInfo.root_title}</p>
                        <div className='flex gap-2 items-center'>•
                            <Link className='text-sm text-default-600 hover:text-blue-500' href={`/@${commentInfo.root_author}/${commentInfo.root_permlink}`}>View the full context</Link>
                        </div>

                        {commentInfo.depth >= 2 && <div className='flex gap-2 items-center'>•
                            <Link className='text-sm text-default-600 hover:text-blue-500' href={`/@${commentInfo.parent_author}/${commentInfo.parent_permlink}`}>View the direct parent</Link>
                        </div>}
                    </Card>}

                <div className='flex flex-col px-1 items-center'>
                    <Card shadow='none'
                        className='w-full gap-4 bg-transparent'>

                        <div className="space-y-4 flex-col">
                            <>
                                <CommentHeader isDetail size='md'
                                    handleEdit={toggleEditMode}
                                    comment={commentInfo} className='w-full' />
                            </>
                            <h2 className="text-xl font-bold text-black dark:text-white">{commentInfo.title}</h2>

                        </div>
                        <div className={clsx(commentInfo.is_muted && ' opacity-80', 'flex flex-col items-center')}>

                            <MarkdownViewer text={commentInfo.body} />
                        </div>

                        <CardFooter className='w-full p-0'>
                            <CommentFooter comment={commentInfo}
                                className={'w-full'} />
                        </CardFooter>
                    </Card>
                </div>

                <DynamicPostReplies comment={commentInfo} />

            </div> : null}
    </div>
    )
}
