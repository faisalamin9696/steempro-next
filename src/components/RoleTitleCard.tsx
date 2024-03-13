import React from 'react'

interface Props {
    comment: Feed | Post
}
export default function RoleTitleCard(props: Props) {
    const { comment } = props;

    if (!comment.author_role && !comment.author_title) return null
    return (<div className='gap-2 flex flex-row'>
        {comment.author_role && <p className='flex-none'>
            {comment.author_role}
        </p>}
        {comment.author_title &&
            <p className='flex-none bg-foreground/10 dark:bg-foreground/30 text-tiny font-light px-1 rounded-lg'>
                {comment.author_title}
            </p >
        }
    </div>

    )
}
