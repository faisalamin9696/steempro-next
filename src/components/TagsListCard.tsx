import { Chip } from '@nextui-org/chip'
import Link from 'next/link'
import React from 'react'

export default function TagsListCard({ tags = [] }: { tags: string[] }) {
    return (
        <div className='flex gap-2 overscroll-x-contain flex-wrap shrink-0'>
            {tags?.filter(tag => !!tag)?.map(tag => {
                return <Chip as={Link} href={`/trending/${tag}`} key={tag}>{tag}</Chip>
            })}
        </div>
    )
}
