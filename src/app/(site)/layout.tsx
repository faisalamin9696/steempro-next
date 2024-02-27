import MainWrapper from '@/components/wrapper/MainWrapper';
import React from 'react'

export default async function Layout({
    children,
    start,
    end,
}: Readonly<{
    children: React.ReactNode,
    start: React.ReactNode,
    end: React.ReactNode,

}>) {
    return (

        <MainWrapper
         
            startContent={start}
            startClassName={'md:block !static'}
        >
            {children}
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
