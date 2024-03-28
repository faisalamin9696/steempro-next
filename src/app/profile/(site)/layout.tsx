import MainWrapper from "@/components/wrappers/MainWrapper";
import { getAuthorExt } from "@/libs/steem/sds";
import { getResizedAvatar } from "@/libs/utils/image";
import usePathnameServer from "@/libs/utils/usePathnameServer";
import { getServerSession } from "next-auth/next";
import AccountHeader from "@/components/AccountHeader";
import ProfileEnd from "./@end/page";
import ProfilePage from "./page";


export default async function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { username } = usePathnameServer();
    const session = await getServerSession();
    const data = await getAuthorExt(username, session?.user?.name || 'null');


    return (
        <main className="main flex flex-col">

            <AccountHeader account={data} />

            <MainWrapper
                endClassName='max-h-screen'

                endContent={<ProfileEnd data={data} />}
            >
                <ProfilePage data={data} />
            </MainWrapper>
        </main>
    );
}


export async function generateMetadata() {
    let { category, username } = usePathnameServer();
    if (!category) {
        category = 'blogs'
    }
    const session = await getServerSession();
    const result = await getAuthorExt(username, session?.user?.name || 'null');
    const { name, about, website } = JSON.parse(result.posting_json_metadata || '{}')?.profile ?? {};

    const capCat = category.charAt(0).toUpperCase() + category.slice(1);
    const pageTitle = !!name ? `${name} (@${username}) - ${capCat} on the Decentralized Web` : `@${username} - ${capCat} on the Decentralized Web`;
    const pageDescription = about || '';

    return {
        title: pageTitle,
        description: pageDescription,
        openGraph: {
            images: [getResizedAvatar(username, 'medium')]
        },
        twitter: {
            images: [getResizedAvatar(username, 'medium')]
        }
    }

}
