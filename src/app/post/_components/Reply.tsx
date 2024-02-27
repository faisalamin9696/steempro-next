import { useAppSelector } from '@/libs/constants/AppFunctions';
import ReplyForm from './ReplyForm';
import { memo } from 'react';

interface Props {
    comment: Post;
    rootComment: Post | Feed;
}

export default memo(function Reply(props: Props) {
    const { comment } = props;

    const commentInfo = useAppSelector(state => state.commentReducer.values)[`${comment.author}/${comment.permlink}`] ?? comment;

    return (
        <div className='flex-col w-full'>
            <ReplyForm {...props} comment={commentInfo} />
        </div>
    )
})
