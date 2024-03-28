import React from 'react'
import { twMerge } from 'tailwind-merge';

interface Props {
    comment: Feed | Post,
    className?: string;
}
export default function RoleTitleCard(props: Props) {
    const { comment, className } = props;

    if (!comment.author_role && !comment.author_title) return null
    return (<div className={twMerge('gap-2 flex flex-row items-center', className)}>
        {comment.author_role && <p className='flex-none'>
            {comment.author_role}
        </p>}
        {comment.author_title &&
            <p className={twMerge('flex-none bg-foreground/10 dark:bg-foreground/30 text-tiny font-light px-1 rounded-lg', className)}>
                {comment.author_title}
            </p >
        }
    </div>

    )
}
