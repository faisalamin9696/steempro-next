import MainWrapper from '@/components/wrapper/MainWrapper';
import usePathnameServer from '@/libs/utils/usePathnameServer';
import React from 'react'
import { ResolvingMetadata } from 'next';

export default async function Layout({
    children,
    start,
}: Readonly<{
    children: React.ReactNode,
    start: React.ReactNode,
    end: React.ReactNode,

}>) {
    return (

        <MainWrapper
            startContent={start}
            startClassName={' max-h-screen md:block !static pr-2'} >
            <div className=' flex flex-col'>
                {children}
            </div>
        </MainWrapper>
    )
}


export async function generateMetadata(parent: ResolvingMetadata) {
    const { category, tag } = usePathnameServer();
    const capCat = category.charAt(0).toUpperCase() + category.slice(1);

    return {
        title: `Latest #${tag} ${category} topic on internet`,
        description: `${capCat} #${tag} topics`,
        openGraph: {
            description: `${capCat} #${tag} topics`
        }
    }
}


