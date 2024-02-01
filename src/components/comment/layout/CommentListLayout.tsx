import { Card } from "@nextui-org/react";
import { CommentProps } from "../CommentCard";
import CommentHeader from "../component/CommentHeader";
import CommentFooter from "../component/CommentFooter";
import { useMemo } from "react";
import MarkdownViewer from "@/components/body/MarkdownViewer";
import BodyShort from "@/components/body/BodyShort";
import CommentCover from "../component/CommentCover";
import { getPostThumbnail } from "@/libs/utils/image";


export default function CommentListLayout(props: CommentProps) {
    const { comment, onReplyClick, isReply } = props;

    const thumbnail = getPostThumbnail(comment.json_images);

    return <div
        className={`w-full card card-compact 
        items-center flex-col p-4 gap-1 dark:bg-default-900/30 bg-default-900/5`}>

        <CommentHeader {...props} comment={comment} className='w-full' />

        <Card isPressable={!isReply}
            onClick={() => onReplyClick && onReplyClick(comment)} shadow='none'
            className='bg-transparent main-comment-list w-full'>
            <div className="flex items-center gap-2 w-full py-0">
                <div className="pl-1 text-container space-y-2">
                    <div className=" text-start font-bold text-md">{comment.title}</div>

                    {useMemo(() => {
                        return isReply ? <div className="description text-xs" >
                            <MarkdownViewer text={comment?.body} />
                        </div> :
                            <div className="text-start text-sm line-clamp-1">
                                <BodyShort body={comment.body} />

                            </div>
                    }, [comment.body])}

                </div>
                <div>
                    {isReply ? null : <CommentCover sm src={thumbnail} />}
                </div>


            </div>

        </Card >

        <CommentFooter {...props} className='w-full' />


    </div >
}


