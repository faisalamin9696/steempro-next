import MainWrapper from '@/components/wrappers/MainWrapper';
import React from 'react'

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


export async function generateMetadata() {
    return {
        title: `Settings - Customize Your SteemCN Experience`,
        description: `Explore the settings page on SteemCN to personalize and optimize your experience on the Steem blockchain. Customize your preferences, security settings, notifications, and more to tailor SteemCN to your needs and preferences.`,
    }
}
