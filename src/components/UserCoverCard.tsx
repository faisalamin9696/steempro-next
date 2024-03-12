import clsx from 'clsx'
import Image from 'next/image'
import React from 'react'
import { twMerge } from 'tailwind-merge'


export default function UserCoverCard(
    { src, large }: { src: string, large?: boolean }
) {
    return (
        <div className={twMerge('rounded-md z-0 transition-all w-full h-44 relative', large ? ' max-2md:h-[18rem] ' : ' max-[720px]:h-[17rem] ')}>
            {src && <Image
                className='rounded-lg'
                fill
                src={src}
                alt="thumbnail"
                sizes="(max-width: 768px,200px),80vw"
                style={{
                    objectFit: 'cover',
                }}
            />
            }
        </div>
    )
}
