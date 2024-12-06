import Image from 'next/image'
import React from 'react'
import { twMerge } from 'tailwind-merge'


export default function UserCoverCard(
    { src, large }: { src: string, large?: boolean }
) {
    return (
        <div className={twMerge('rounded-md z-0 w-full h-44 relative max-1md:h-[16rem]', large ? ' max-1md:h-[16rem] ' : ' max-[720px]:h-[18rem] ')}>
            {src && <Image
                className='rounded-lg'
                fill
                src={src}
                onError={(e) => {
                    e.currentTarget.style.opacity = '0';

                }}
                alt="cover"
                sizes="(max-width: 768px,200px),80vw"
                style={{
                    objectFit: 'cover',
                }}
            />
            }
        </div>
    )
}
