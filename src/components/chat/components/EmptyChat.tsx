import React from 'react'

export default function EmptyChat({ username }: { username: string }) {
    return (
        <p className='text-center text-default-600 mt-4 p-4 text-sm'>
            {`Start chat with ${username}`} 💬
        </p>
    )
}
