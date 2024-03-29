import MainWrapper from "@/components/wrappers/MainWrapper";
import { getCommunity } from "@/libs/steem/sds";
import { getResizedAvatar } from "@/libs/utils/image";
import usePathnameServer from "@/libs/utils/usePathnameServer";
import { ResolvingMetadata } from "next";
import { getServerSession } from "next-auth/next";
import CommunityPage from "./page";
import ProfileInfoCard from "@/components/ProfileInfoCard";
import AccountHeader from "@/components/AccountHeader";


export default async function Layout({
    children,
    start,
    end,
}: Readonly<{
    children: React.ReactNode;
    start: React.ReactNode;
    end: React.ReactNode;
}>) {
    const { community } = usePathnameServer();
    const session = await getServerSession();

    const data = await getCommunity(community, session?.user?.name || 'null');

    return (
        <main className="main flex flex-col">

            <AccountHeader community={data} />
            <MainWrapper
                endClassName='max-h-screen'
                endContent={<ProfileInfoCard hideAvatar
                    key={Math.random()} community={data} username={data.account} />
                }>
                <CommunityPage data={data} />
            </MainWrapper>
        </main>
    );
}


export async function generateMetadata(parent: ResolvingMetadata) {
    const { category, community } = usePathnameServer();
    const previousImages = (await parent)?.openGraph?.images || [];
    const result = await getCommunity(community);
    const { title, about } = result ?? {};
    const pageTitle = title ? `${title} - ${category} in the ${community} Community` : `${community} Community ${category} List`;
    const pageDescription = about || '';

    return {
        title: pageTitle,
        description: pageDescription,
        openGraph: {
            images: [getResizedAvatar(result.account, 'medium'), ...previousImages]
        },
        twitter: {
            images: [getResizedAvatar(result.account, 'medium'), ...previousImages]
        }
    }


}
