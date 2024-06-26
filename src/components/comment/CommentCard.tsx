"use client"

import { memo } from 'react';
import './style.scss';

import { useAppSelector } from '@/libs/constants/AppFunctions';
import { getSettings } from '@/libs/utils/user';
import CommentListLayout from './layouts/CommentListLayout';
import CommentBlogLayout from './layouts/CommentBlogsLayout';
import CommentGridLayout from './layouts/CommentGridLayout';
import { useDeviceInfo } from '@/libs/utils/useDeviceInfo';

interface Props {
    comment: Feed | Post;
    isReply?: boolean;
}


export interface CommentProps {
    comment: Feed | Post;
    className?: string;
    isReply?: boolean;
    compact?: boolean;
    isDetails?: boolean;
    onEditClick?: (comment: Feed | Post) => void;
    onDeleteClick?: (comment: Feed | Post) => void;
    onMuteClick?: (comment: Feed | Post) => void;
    onPinClick?: (comment: Feed | Post) => void;
    onCommentsClick?: () => void;
    onPublishClick?: (comment: Feed | Post) => void;
    isSearch?: boolean;
}

export default memo(function CommentCard(props: Props) {
    const { comment } = props;
    const commentInfo = useAppSelector(state => state.commentReducer.values)[`${comment?.author}/${comment?.permlink}`] ?? comment;
    const settings = useAppSelector(state => state.settingsReducer.value) ?? getSettings();
    const { isMobile } = useDeviceInfo();


    const commentLayout =
        isMobile ? <CommentBlogLayout {...props} comment={commentInfo} /> :
            settings.feedStyle === 'list' ?
                <CommentListLayout {...props} comment={commentInfo} /> :
                settings.feedStyle === 'grid' ? <CommentGridLayout comment={comment} /> :
                    settings.feedStyle === 'blogs' ? <CommentBlogLayout {...props} comment={commentInfo} /> :
                        <CommentListLayout {...props} comment={commentInfo} />


    return (commentLayout)
}
)
