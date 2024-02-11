import { getPost } from '@/libs/steem/sds';
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


    return {
        title: (result.title) + ' | SteemPro',
        description: result.body ?? '',
        openGraph: {
            images: [JSON.parse(result?.json_images ?? `[]`), ...previousImages]
        }
    }
}
