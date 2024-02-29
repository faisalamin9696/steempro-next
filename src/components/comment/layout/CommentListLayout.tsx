import { Card } from "@nextui-org/react";
import { CommentProps } from "../CommentCard";
import CommentHeader from "../component/CommentHeader";
import CommentFooter from "../component/CommentFooter";
import MarkdownViewer from "@/components/body/MarkdownViewer";
import BodyShort from "@/components/body/BodyShort";
import CommentCover from "../component/CommentCover";
import { getPostThumbnail } from "@/libs/utils/image";
import { useAppSelector } from "@/libs/constants/AppFunctions";


export default function CommentListLayout(props: CommentProps) {
    const { comment, onReplyClick, isReply } = props;
    const commentInfo = useAppSelector(state => state.commentReducer.values)[`${comment.author}/${comment.permlink}`] ?? comment;

    const thumbnail = getPostThumbnail(commentInfo.json_images);

    return <div
        className={`w-full card card-compact shadow-md
        items-center flex-col p-4 gap-1 bg-white/60 dark:bg-white/10`}>

        <CommentHeader compact comment={commentInfo} className='w-full' />

        <Card isPressable={!isReply} radius='none'
            onClick={() => onReplyClick && onReplyClick(commentInfo)} shadow='none'
            className='bg-transparent main-comment-list w-full'>
            <div className="flex items-center gap-2 w-full py-0">
                <div className="pl-1 text-container space-y-2">
                    <div className=" text-start font-bold text-md">{commentInfo.title}</div>

                    {isReply ? <div className="description text-xs" >
                        <MarkdownViewer text={commentInfo?.body} />
                    </div> :
                        <div className="text-start text-sm line-clamp-1">
                            <BodyShort body={commentInfo.body} />

                        </div>
                    }

                </div>
                <div>
                    {isReply ? null : <CommentCover sm src={thumbnail} />}
                </div>


            </div>

        </Card >

        <CommentFooter {...props} comment={commentInfo} className='w-full' />


    </div >
}


