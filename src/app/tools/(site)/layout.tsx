import MainWrapper from "@/components/wrappers/MainWrapper";

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
        title: `SteemPro Tools - Enhancing Your Steem Experience`,
        description: `Discover a suite of powerful tools tailored for Steem users, designed to streamline your interactions, boost efficiency, and elevate your Steem experience to new heights.`,
    }
}