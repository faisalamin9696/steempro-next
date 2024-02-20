import MainWrapper from "@/components/wrapper/MainWrapper";


export default async function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main className="main flex flex-col">
            <MainWrapper>
                {children}
            </MainWrapper>
        </main>
    );
}