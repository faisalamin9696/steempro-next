import MainWrapper from '@/components/wrapper/MainWrapper';
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
        title: `Settings - Customize Your SteemPro Experience`,
        description: `Explore the settings page on SteemPro to personalize and optimize your experience on the Steem blockchain. Customize your preferences, security settings, notifications, and more to tailor SteemPro to your needs and preferences.`,
        openGraph: {
            description: `Explore the settings page on SteemPro to personalize and optimize your experience on the Steem blockchain. Customize your preferences, security settings, notifications, and more to tailor SteemPro to your needs and preferences.`
        }
    }
}
