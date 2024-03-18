import MainWrapper from '@/components/wrapper/MainWrapper';
import React from 'react'
import HomeCarousel from '@/components/carousal/HomeCarousal';
import { ResolvingMetadata } from 'next';
import usePathnameServer from '@/libs/utils/usePathnameServer';

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
                <HomeCarousel />
                {children}
            </div>
        </MainWrapper>
    )
}


export async function generateMetadata(parent: ResolvingMetadata) {
    const { category } = usePathnameServer();
    const capCat = category.charAt(0).toUpperCase() + category.slice(1);

    return {
        title: `${capCat} topics`,
        description: `Explore ${category} discussions on a user-owned social network.`,
        openGraph: {
            description: `Explore ${category} discussions on a user-owned social network.`
        }
    }
}
