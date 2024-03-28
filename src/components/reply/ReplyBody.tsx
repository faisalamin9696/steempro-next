import Reputation from '@/components/Reputation'
import SAvatar from '@/components/SAvatar'
import MarkdownViewer from '@/components/body/MarkdownViewer'
import TimeAgoWrapper from '@/components/wrappers/TimeAgoWrapper'
import clsx from 'clsx'
import Link from 'next/link'
import React from 'react'
import RoleTitleCard from '../RoleTitleCard'

export default function ReplyBody({ comment, rightContent }: { comment: Post, rightContent?: React.ReactNode }) {
    return (
        <div className='flex gap-2 w-full '>
            <div className='flex flex-col text-sm sm:text-medium-100 w-full'>
                <div className='flex justify-between'>
                    <div className='flex-col items-start'>
                        <div className='flex items-center'>
                            <SAvatar size='xs' username={comment.author} className='block sm:hidden me-1' />
                            <div className='flex gap-1 items-center'>
                                <p>{comment.author}</p>
                                <Reputation reputation={comment.author_reputation} />
                                <Link href={`/${comment.category}/@${comment.author}/${comment.permlink}`}>
                                    <TimeAgoWrapper created={comment.created * 1000}
                                        lastUpdate={comment.last_update * 1000} />
                                </Link>

                            </div>
                        </div>
                        <RoleTitleCard comment={comment} className='text-default-500 gap-1 text-tiny' />


                    </div>

                    <div>
                        {rightContent}
                    </div>
                </div>
                <div className={clsx(comment.is_muted === 1 && 'opacity-60')}>
                    <MarkdownViewer text={comment.body}
                        className={`!prose-sm !w-full !max-w-none`} />
                </div>
            </div>

        </div>
    )
}
