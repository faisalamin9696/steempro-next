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
        title: `Steem Blockchain Witnesses: Trusted Block Producers`,
        description: `Discover the trusted witnesses (block producers) contributing to the security and governance of the Steem blockchain. Learn about their role and contributions.`,
    }
}