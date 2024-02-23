import MainWrapper from "@/components/wrapper/MainWrapper";
import { Metadata } from "next";
import SubmitPage from "./page";

export const metadata: Metadata = {
    title: 'Submit',
}


export default async function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <main className="main">
            <MainWrapper>
                <SubmitPage />
            </MainWrapper>
        </main>
    );
}
