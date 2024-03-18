import MainWrapper from '@/components/wrapper/MainWrapper';
import usePathnameServer from '@/libs/utils/usePathnameServer';
import React from 'react'
import HomeStart from '@/app/(site)/@start/page';

export default async function Layout({
    children,
}: Readonly<{
    children: React.ReactNode,
    end: React.ReactNode,

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
    const capCat = category.charAt(0).toUpperCase() + category.slice(1);

    return {
        title: `Latest #${tag} ${category} topic on internet`,
        description: `#${tag} ${capCat}: Explore the latest topics on ${tag}.`,
        openGraph: {
            description: `#${tag} ${capCat}: Explore the latest topics on ${tag}.`,
        }
    }
}


