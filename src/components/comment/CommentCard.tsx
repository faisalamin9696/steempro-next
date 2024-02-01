"use client"

import { useMemo } from 'react';
import './style.scss';
import CommentFooter from './component/CommentFooter';

import { Card } from '@nextui-org/react';
import CommentHeader from './component/CommentHeader';
import CommentCover from './component/CommentCover';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/libs/constants/AppFunctions';
import { useMobile } from '@/libs/utils/useMobile';
import { getSettings } from '@/libs/utils/user';
import MarkdownViewer from '@/components/body/MarkdownViewer';
import BodyShort from '@/components/body/BodyShort';
import { getCoverImageUrl, getPostThumbnail } from '@/libs/utils/image';
import { ClassValue } from 'clsx';
import CommentListLayout from './layout/CommentListLayout';
import CommentBlogLayout from './layout/CommentBlogsLayout';
import CommentGridLayout from './layout/CommentGridLayout';

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

export default function CommentCard(props: Props) {
    const { comment } = props;
    const commentInfo = useAppSelector(state => state.commentReducer.values)[`${comment?.author}/${comment?.permlink}`] ?? comment;
    const settings = useAppSelector(state => state.settingsReducer.value) ?? getSettings();
    const isMobile = useMobile();
    const router = useRouter();

    function handlePostClick() {
        router.push(`/${commentInfo.category}/@${commentInfo.author}/${commentInfo.permlink}`,
            { scroll: false });
    }

    const commentLayout = useMemo(() =>
        isMobile ? <CommentBlogLayout {...props} comment={commentInfo} onReplyClick={handlePostClick} /> :
            settings.feedStyle === 'list' ?
                <CommentListLayout {...props} comment={commentInfo} onReplyClick={handlePostClick} /> :
                settings.feedStyle === 'grid' ? <CommentGridLayout comment={comment} /> :
                    settings.feedStyle === 'blogs' ? <CommentBlogLayout {...props} comment={commentInfo} onReplyClick={handlePostClick} /> :
                        <CommentListLayout {...props} comment={commentInfo} onReplyClick={handlePostClick} />
        , [settings.feedStyle, isMobile]);


    return (<div className='mb-2' key={comment.link_id}>
        {commentLayout}
    </div>

    )
}

