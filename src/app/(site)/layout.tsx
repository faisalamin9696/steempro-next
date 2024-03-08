import MainWrapper from '@/components/wrapper/MainWrapper';
import { getServerSession } from 'next-auth';
import React from 'react'
import HomePage from './page';
import HomeCarousel from '@/components/carousal/HomeCarousal';

export default async function Layout({
    children,
    start,
    end,
}: Readonly<{
    children: React.ReactNode,
    start: React.ReactNode,
    end: React.ReactNode,

}>) {
    const session = await getServerSession();

    return (


        <MainWrapper

            startContent={start}
            startClassName={' max-h-screen md:block !static'} >
            <div className=' flex flex-col'>
                <HomeCarousel  />

                <HomePage isLogin={!!session?.user?.name} />
            </div>
        </MainWrapper>
    )
}


// export async function generateMetadata(parent: ResolvingMetadata) {
//     const { username, permlink } = usePathnameServer();
//     const result = await getPost(username, permlink);
//     const previousImages = (await parent).openGraph?.images || [];


//     return {
//         title: (result.title) + ' | SteemPro',
//         description: result.body ?? '',
//         openGraph: {
//             images: [JSON.parse(result?.json_images ?? `[]`), ...previousImages]
//         }
//     }
// }
