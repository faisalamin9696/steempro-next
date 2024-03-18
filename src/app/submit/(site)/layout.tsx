import MainWrapper from "@/components/wrapper/MainWrapper";

export default async function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <main className="main">
            <MainWrapper>
                {children}
            </MainWrapper>
        </main>
    );
}

export async function generateMetadata() {
    return {
        title: `Create and Submit - Share Your Ideas with the World!`,
        description: `Submit your posts, articles, and content to SteemPro and reach a global audience. Join our community and share your ideas, stories, and insights with the world. Start contributing today!`,
        openGraph: {
            description: `Submit your posts, articles, and content to SteemPro and reach a global audience. Join our community and share your ideas, stories, and insights with the world. Start contributing today!`
        }
    }
}