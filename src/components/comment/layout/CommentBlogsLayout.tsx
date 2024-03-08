import { Card } from "@nextui-org/react";
import { CommentProps } from "../CommentCard";
import CommentHeader from "../component/CommentHeader";
import { getPostThumbnail } from "@/libs/utils/image";
import CommentCover from "../component/CommentCover";
import BodyShort from "@/components/body/BodyShort";
import MarkdownViewer from "@/components/body/MarkdownViewer";
import CommentFooter from "../component/CommentFooter";
import { useAppSelector } from "@/libs/constants/AppFunctions";

export default function CommentBlogLayout(props: CommentProps) {
    const { comment, onReplyClick, isReply } = props;
    const commentInfo = useAppSelector(state => state.commentReducer.values)[`${comment.author}/${comment.permlink}`] ?? comment;

    const thumbnail = getPostThumbnail(commentInfo.json_images);

    return <div className='w-full card card-compact flex-col gap-4 
    bg-white/60 dark:bg-white/10'>

        <div className='p-4'>
            <CommentHeader comment={commentInfo} compact className='w-full' />


        </div>
        <Card isPressable={!isReply} radius='none'
            onClick={() => onReplyClick && onReplyClick(commentInfo)}
            shadow='none'
            className='w-full bg-transparent gap-4 px-4'>

            <h2 className="card-content font-bold text-lg text-start ">{comment.title}</h2>

            {isReply ? null : <CommentCover thumbnail src={thumbnail} />}


            <p className='card-content line-clamp-2 overflow-hidden text-start w-full h-full'>

                {isReply ? <MarkdownViewer text={commentInfo?.body} /> :
                    <BodyShort body={commentInfo.body} />
                }


            </p>

        </Card>

        <CommentFooter comment={commentInfo} 
            className='w-full' />

    </div>
}

