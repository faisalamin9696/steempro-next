import { getPost } from '@/libs/steem/sds';
import { getPostThumbnail } from '@/libs/utils/image';
import usePathnameServer from '@/libs/utils/usePathnameServer';
import { ResolvingMetadata } from 'next';
import React from 'react'

export default async function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (

        <div>{children}</div>
    )
}


export async function generateMetadata(parent: ResolvingMetadata) {
    const { username, permlink } = usePathnameServer();
    const result = await getPost(username, permlink);
    const previousImages = (await parent).openGraph?.images || [];

    const thumbnail = getPostThumbnail(result?.json_images);

    return {
        title: (result.title),
        description: result.body?.substring(0,250) ?? '',
        openGraph: {
            images: [thumbnail, ...previousImages]
        }
    }
}
