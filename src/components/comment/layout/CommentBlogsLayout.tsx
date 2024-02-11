import { Card } from "@nextui-org/react";
import { CommentProps } from "../CommentCard";
import CommentHeader from "../component/CommentHeader";
import { getPostThumbnail } from "@/libs/utils/image";
import CommentCover from "../component/CommentCover";
import BodyShort from "@/components/body/BodyShort";
import MarkdownViewer from "@/components/body/MarkdownViewer";
import { useMemo } from "react";
import CommentFooter from "../component/CommentFooter";

export default function CommentBlogLayout(props: CommentProps) {
    const { comment, onReplyClick, isReply } = props;

    const thumbnail = getPostThumbnail(comment.json_images);

    return <div className='w-full card card-compact flex-col gap-4 dark:bg-default-900/30 bg-default-900/5'>

        <div className='p-4'>
            <CommentHeader {...props} comment={comment} className='w-full' />


        </div>
        <Card isPressable={!isReply} radius='none'
            onClick={() => onReplyClick && onReplyClick(comment)}
            shadow='none'
            className='w-full bg-transparent gap-4 px-4'>

            <h2 className="card-content font-bold text-lg text-start ">{comment.title}</h2>

            {isReply ? null : <CommentCover src={thumbnail} />}


            <p className='card-content line-clamp-2 overflow-hidden text-start w-full h-full'>

                {useMemo(() => {
                    return isReply ? <MarkdownViewer text={comment?.body} /> :
                        <BodyShort body={comment.body} />
                }, [comment.body])}


            </p>

        </Card>

        <div className='p-4'>
            <CommentFooter {...props}
                className='w-full' />

        </div>
    </div>
}

