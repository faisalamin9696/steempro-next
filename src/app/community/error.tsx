'use client'

import ErrorCard from '@/components/ErrorCard'
import { useEffect } from 'react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <ErrorCard onPress={reset} message={error.message} />
    )
}