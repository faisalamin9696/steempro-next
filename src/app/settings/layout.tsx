import MainWrapper from '@/components/wrapper/MainWrapper'
import React from 'react'

export default function layout({ children }: { children: React.ReactNode }) {
    return (
        <MainWrapper>
            {children}
        </MainWrapper>
    )
}
