import MainWrapper from '@/components/wrapper/MainWrapper';
import { Metadata } from 'next';
import React from 'react'

export const metadata: Metadata = {
    title: `Communities on SteemPro - Join Engaging Discussions`,
    description: `Explore diverse communities on SteemPro, a user-owned social network. Join engaging discussions, share your passions, and connect with like-minded individuals.`,

};


export default async function Layout({
    children,
}: Readonly<{
    children: React.ReactNode,

}>) {

    return (
        <MainWrapper>
            {children}
        </MainWrapper>
    )
}

