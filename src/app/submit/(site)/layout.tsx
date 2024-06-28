import MainWrapper from "@/components/wrappers/MainWrapper";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="main">
      <MainWrapper>{children}</MainWrapper>
    </main>
  );
}

export async function generateMetadata() {
  const keywords = [
    "submit posts to SteemPro",
    "share ideas with global audience",
    "SteemPro community",
    "submit articles to SteemPro",
    "reach global audience",
    "SteemPro contributions",
    "SteemPro content submission",
    "share stories on SteemPro",
    "SteemPro ideas",
    "SteemPro platform",
  ];
  return {
    title: `Create and Submit - Share Your Ideas with the World!`,
    description: `Submit your posts, articles, and content to SteemPro and reach a global audience. Join our community and share your ideas, stories, and insights with the world. Start contributing today!`,
    keywords: keywords.join(", "),
  };
}
