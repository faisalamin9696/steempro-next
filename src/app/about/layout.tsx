import MainWrapper from '@/components/wrappers/MainWrapper';
import { Metadata } from 'next';
import React from 'react'

export const metadata: Metadata = {
    title: `About SteemPro - Empowering Your Steem Experience`,
    description: `Learn more about SteemPro, the leading platform dedicated to providing valuable insights, resources, and community engagement opportunities for Steem enthusiasts. Discover our mission, vision, and commitment to empowering your journey on the Steem blockchain.`,

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

