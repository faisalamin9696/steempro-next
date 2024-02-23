import MainWrapper from "@/components/wrapper/MainWrapper";
import type { Metadata, ResolvingMetadata } from "next";
import ProfileHeader from "../_components/ProfileHeader";
import { empty_profile } from "@/libs/constants/Placeholders";
import { getAuthorExt } from "@/libs/steem/sds";
import { getResizedAvatar } from "@/libs/utils/image";
import usePathnameServer from "@/libs/utils/usePathnameServer";
import { getServerSession } from 'next-auth';
import ProfileEnd from "./@end/page";


export default async function Layout({
    children,
    start,
    end,
}: Readonly<{
    children: React.ReactNode;
    start: React.ReactNode;
    end: React.ReactNode;
}>) {
    const { username } = usePathnameServer();
    const session = await getServerSession();
    const data = await getAuthorExt(username, session?.user?.name || 'null');

    return (
        <main className="main flex flex-col">

            <ProfileHeader data={data} />

            <MainWrapper
                // startContent={start}
                endContent={end}>
                {children}
            </MainWrapper>
        </main>
    );
}


export async function generateMetadata(parent: ResolvingMetadata) {
    const { username } = usePathnameServer();
    const session = await getServerSession();

    const previousImages = (await parent)?.openGraph?.images || [];
    const result = await getAuthorExt(username, session?.user?.name || 'null');
    const { name, about, website } = JSON.parse(result.posting_json_metadata || '{}');
    return {
        title: (name ? `${name} (@${username})` : username) ?? `(@${username})`,
        description: about ?? '',
        openGraph: {
            images: [getResizedAvatar(username), ...previousImages]
        }
    }

}
