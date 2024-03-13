"use client"

import { memo } from 'react';
import './style.scss';

import { useAppSelector } from '@/libs/constants/AppFunctions';
import { getSettings } from '@/libs/utils/user';
import { ClassValue } from 'clsx';
import CommentListLayout from './layout/CommentListLayout';
import CommentBlogLayout from './layout/CommentBlogsLayout';
import CommentGridLayout from './layout/CommentGridLayout';
import { useDeviceInfo } from '@/libs/utils/useDeviceInfo';

interface Props {
    comment: Feed | Post;
    isReply?: boolean;
}


export interface CommentProps {
    comment: Feed | Post;
    className?: ClassValue;
    isReply?: boolean;
    compact?: boolean;
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
