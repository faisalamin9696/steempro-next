import Image from 'next/image'
import React from 'react'


export default function UserCoverCard(
    { src }: { src: string }
) {
    return (
        <div className='rounded-md z-0 transition-all w-full h-44 max-[720px]:h-[17rem] relative'>
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
