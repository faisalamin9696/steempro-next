import MainWrapper from "@/components/wrappers/MainWrapper";
import SubmitPage from "./SubmitPage";
import { getMetadata } from "@/utils/metadata";
import { Metadata } from "next";

const { title, description, keywords } = getMetadata.submit();
export const metadata: Metadata = {
  title,
  description,
  keywords: keywords.join(", "),
};

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
