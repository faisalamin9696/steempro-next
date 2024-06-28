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
    "Steem blockchain witnesses",
    "trusted block producers",
    "Steem block producers",
    "blockchain security",
    "blockchain governance",
    "Steem blockchain",
    "witness role",
    "witness contributions",
    "Steem network",
    "block producer responsibilities",
  ];

  return {
    title: `Steem Blockchain Witnesses: Trusted Block Producers`,
    description: `Discover the trusted witnesses (block producers) contributing to the security and governance of the Steem blockchain. Learn about their role and contributions.`,
    keywords: keywords.join(", "),
  };
}
