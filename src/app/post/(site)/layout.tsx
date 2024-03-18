import { getPost } from '@/libs/steem/sds';
import { getPostThumbnail } from '@/libs/utils/image';
import { postSummary } from '@/libs/utils/postSummary';
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

    const pageTitle = result.depth === 0 ? result.title : `RE: ${result.root_title}`;
    const pageDescription = result.depth === 0 ? pageTitle + ` by @${result.author}` :
        `${postSummary(result.body)} by ${result.author}`;

    return {
        title: pageTitle,
        description: pageDescription ?? '',
        openGraph: {
            images: [thumbnail, ...previousImages]
        }
    }
}
