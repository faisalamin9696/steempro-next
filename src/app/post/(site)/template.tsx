
import MainWrapper from "@/components/wrapper/MainWrapper";
import { getPost } from "@/libs/steem/sds";
import usePathnameServer from "@/libs/utils/usePathnameServer";
import PostPage from "./page";
import { ResolvingMetadata } from "next";
import { getServerSession } from "next-auth";
import PostEnd from "./@end/page";
import PostStart from "./@start/page";


export default async function Layout({
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
    const tag = data.community ? JSON.parse(data.json_metadata)?.['tags'][0] : data.category

    return (
        <main className="main" key={permlink}>
            <MainWrapper
                startContent={<PostStart />}
                endContent={<PostEnd tag={tag} />}>
                <PostPage data={data} />
            </MainWrapper>
        </main>
    );
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
