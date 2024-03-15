import { Card } from "@nextui-org/react";
import { CommentProps } from "../CommentCard";
import CommentHeader from "../component/CommentHeader";
import CommentFooter from "../component/CommentFooter";
import MarkdownViewer from "@/components/body/MarkdownViewer";
import BodyShort from "@/components/body/BodyShort";
import CommentCover from "../component/CommentCover";
import { getPostThumbnail } from "@/libs/utils/image";
import { useAppSelector } from "@/libs/constants/AppFunctions";
import clsx from "clsx";
import Link from "next/link";
import { hasNsfwTag } from "@/libs/utils/StateFunctions";
import { getSettings } from "@/libs/utils/user";


export default function CommentListLayout(props: CommentProps) {
    const { comment, isReply } = props;
    const commentInfo = useAppSelector(state => state.commentReducer.values)[`${comment.author}/${comment.permlink}`] ?? comment;
    const settings = useAppSelector(state => state.settingsReducer.value) ?? getSettings();
    const thumbnail = getPostThumbnail(commentInfo.json_images);
    const targetUrl = `/${comment.category}/@${comment.author}/${comment.permlink}`;
    const isNsfw = hasNsfwTag(comment) && (settings?.nsfw !== 'Always show');

    return <div
        className={`w-full card card-compact shadow-md
        items-center flex-col p-4 gap-1 bg-white/60 dark:bg-white/10`}>

        <CommentHeader compact comment={commentInfo} className='w-full' />

        <Card as={Link} href={targetUrl} radius='none' shadow='none'
            className={clsx(commentInfo.is_muted && ' opacity-80', 'bg-transparent main-comment-list w-full')}>
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
                    {isReply ? null : <CommentCover isNsfw={(isNsfw)} sm src={thumbnail} />}
                </div>


            </div>

        </Card >

        <CommentFooter {...props} comment={commentInfo} className='w-full' />


    </div >
}


