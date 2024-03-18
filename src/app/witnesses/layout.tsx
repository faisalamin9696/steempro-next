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
        title: `Witnesses of Steem Blockchain`,
        description: `Witnessess (block producer) of Steem Blockchain`,
    }
}