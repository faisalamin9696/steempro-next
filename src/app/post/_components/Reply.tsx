import { useAppSelector } from '@/libs/constants/AppFunctions';
import ReplyForm from './ReplyForm';
import { memo } from 'react';
import SAvatar from '@/components/SAvatar';

interface Props {
    comment: Post;
    rootComment: Post | Feed;
}

export default memo(function Reply(props: Props) {
    const { comment } = props;
    const commentInfo: Post = useAppSelector(state => state.commentReducer.values)[`${comment.author}/${comment.permlink}`] ?? comment;

    return (
        <div className='flex-col w-full relative'>

            <div className='flex gap-2 '>
                <div className='flex flex-col gap-2 items-center'>

                     
                    <SAvatar size='1xs' username={commentInfo.author} className='hidden sm:block' />
                    <div className='w-[1px] border-default-200 h-full bg-foreground/5 '>

                    </div>
                </div>
                <div className=' flex items-start gap-2 w-full '>
                    {!commentInfo.link_id ? null : <ReplyForm
                        {...props} comment={commentInfo} />}
                </div>
            </div>
            




        </div>
    )
})
