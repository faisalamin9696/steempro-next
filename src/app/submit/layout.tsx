import MainWrapper from "@/components/wrappers/MainWrapper";
import SubmitPage from "./SubmitPage";

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

export async function generateMetadata() {
  const keywords = [
    "submit posts to SteemCN",
    "share ideas with global audience",
    "SteemCN community",
    "submit articles to SteemCN",
    "reach global audience",
    "SteemCN contributions",
    "SteemCN content submission",
    "share stories on SteemCN",
    "SteemCN ideas",
    "SteemCN platform",
  ];
  return {
    title: `Create and Submit - Share Your Ideas with the World!`,
    description: `Submit your posts, articles, and content to SteemCN and reach a global audience. Join our community and share your ideas, stories, and insights with the world. Start contributing today!`,
    keywords: keywords.join(", "),
  };
}
