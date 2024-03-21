import MainWrapper from '@/components/wrapper/MainWrapper';
import usePathnameServer from '@/libs/utils/usePathnameServer';
import React from 'react'
import HomeStart from '@/app/(site)/@start/page';

export default async function Layout({
    children,
}: Readonly<{
    children: React.ReactNode,
}>) {
    return (

        <MainWrapper
            startContent={<HomeStart />}
            startClassName={' max-h-screen md:block !static pr-2'} >
            <div className=' flex flex-col'>
                {children}
            </div>
        </MainWrapper>
    )
}


export async function generateMetadata() {
    const { category, tag } = usePathnameServer();
    // const capCat = category.charAt(0).toUpperCase() + category.slice(1);
    const pageTitle = `Latest #${tag} ${category} topics on the Internet`;
    const pageDescription = `Explore the latest ${category} discussions and topics related to #${tag} on the internet. Stay updated with the most recent conversations and insights.`;

    return {
        title: pageTitle,
        description: pageDescription,
    }
}


