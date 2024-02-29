
import MainWrapper from "@/components/wrapper/MainWrapper";
import { getPost } from "@/libs/steem/sds";
import usePathnameServer from "@/libs/utils/usePathnameServer";
import PostPage from "./page";
import { getServerSession } from "next-auth/next";
import PostStart from "./@start/page";
import ProfileInfoCard from "@/components/ProfileInfoCard";

export default async function LayoutTemplate({
    children,
    start,
    end,
}: Readonly<{
    children: React.ReactNode;
    start: React.ReactNode;
    end: React.ReactNode;
}>) {
    const { username, permlink } = usePathnameServer();
    const session = await getServerSession();

    const data = await getPost(username, permlink, session?.user?.name || 'null');
    // const tag = data.community ? JSON.parse(data.json_metadata)?.['tags'][0] : data.category

    return (
        <main className="main" key={permlink}>
            <MainWrapper
                endClassName={'md:block !overflow-hidden'}
                startClassName=' h-screen lg:block'
                startContent={<PostStart />}
                endContent={<ProfileInfoCard profile username={username} />}>
                <PostPage data={data} />
            </MainWrapper>
        </main>
    );
}
