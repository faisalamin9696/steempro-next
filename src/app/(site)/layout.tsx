import MainWrapper from '@/components/wrapper/MainWrapper';
import React from 'react'
import HomeCarousel from '@/components/carousal/HomeCarousal';
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


export async function generateMetadata() {
    let { category } = usePathnameServer();
    if (!category)
        category = 'trending';

    const capCat = category.charAt(0).toUpperCase() + category.slice(1);
    const pageTitle = `${capCat} topics`;
    const pageDescription = `Explore ${category} discussions on a user-owned social network. ${capCat} topics cover a wide range of interests and perspectives, providing valuable insights and lively conversations.`;


    return {
        title: pageTitle,
        description: pageDescription,
    }
}
