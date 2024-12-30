import React from 'react'

export default function EmptyList({ text }: { text?: string }) {
    return (
        <p className='text-center text-default-600 mt-4 p-4 text-sm'>
            {text ?? `Yay! You have seen it all`} 🌟
        </p>
    )
}
