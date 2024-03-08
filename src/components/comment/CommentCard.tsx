"use client"

import { memo, useMemo } from 'react';
import './style.scss';

import { useRouter } from 'next13-progressbar';
import { useAppSelector } from '@/libs/constants/AppFunctions';
import useMobile from '@/libs/utils/useMobile';
import { getSettings } from '@/libs/utils/user';
import { ClassValue } from 'clsx';
import CommentListLayout from './layout/CommentListLayout';
import CommentBlogLayout from './layout/CommentBlogsLayout';
import CommentGridLayout from './layout/CommentGridLayout';
import { pushWithCtrl } from '@/libs/utils/helper';

type Props = {
    comment: Feed | Post;
    isReply?: boolean;
}


export type CommentProps = {
    comment: Feed | Post;
    className?: ClassValue;
    isReply?: boolean;
    compact?: boolean;
    onReplyClick?: (comment: Feed | Post) => void;
    onEditClick?: (comment: Feed | Post) => void;
    onDeleteClick?: (comment: Feed | Post) => void;
    onMuteClick?: (comment: Feed | Post) => void;
    onPinClick?: (comment: Feed | Post) => void;
    onPublishClick?: (comment: Feed | Post) => void;
}

export default memo(function CommentCard(props: Props) {
    const { comment } = props;
    const commentInfo = useAppSelector(state => state.commentReducer.values)[`${comment?.author}/${comment?.permlink}`] ?? comment;
    const settings = useAppSelector(state => state.settingsReducer.value) ?? getSettings();
    const isMobile = useMobile();
    const router = useRouter();

    function handlePostClick(event) {
        const targetUrl = `/${commentInfo.category}/@${commentInfo.author}/${commentInfo.permlink}`;
        pushWithCtrl(event, router, targetUrl, true);
    }

    const commentLayout =
        isMobile ? <CommentBlogLayout {...props} comment={commentInfo} onReplyClick={handlePostClick} /> :
            settings.feedStyle === 'list' ?
                <CommentListLayout {...props} comment={commentInfo} onReplyClick={handlePostClick} /> :
                settings.feedStyle === 'grid' ? <CommentGridLayout comment={comment} onReplyClick={handlePostClick} /> :
                    settings.feedStyle === 'blogs' ? <CommentBlogLayout {...props} comment={commentInfo} onReplyClick={handlePostClick} /> :
                        <CommentListLayout {...props} comment={commentInfo} onReplyClick={handlePostClick} />


    return (<div className='mb-2' key={comment.link_id}>
        {commentLayout}
    </div>

    )
}
)
