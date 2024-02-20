
import MainWrapper from "@/components/wrapper/MainWrapper";
import { getPost } from "@/libs/steem/sds";
import usePathnameServer from "@/libs/utils/usePathnameServer";
import PostPage from "./page";
import { ResolvingMetadata } from "next";
import { getServerSession } from "next-auth";
import PostEnd from "./@end/page";
import PostStart from "./@start/page";

export default async function LayoutTemplate({
}: Readonly<{
    children: React.ReactNode;
    start: React.ReactNode;
    end: React.ReactNode;
}>) {
    const { username, permlink } = usePathnameServer();
    const session = await getServerSession();

    const data = await getPost(username, permlink, session?.user?.name || 'null');
    const tag = data.community ? JSON.parse(data.json_metadata)?.['tags'][0] : data.category

    return (
        <main className="main" key={permlink}>
            <MainWrapper
                endClassName={'md:block'}
                startContent={<PostStart />}
                endContent={<PostEnd tag={tag} />}>
                <PostPage data={data} />
            </MainWrapper>
        </main>
    );
}
