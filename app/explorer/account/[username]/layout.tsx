import { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.steempro.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const canonical = `${BASE_URL}/explorer/account/${username}`;
  const pageTitle = `@${username} — Steem account data`;
  const pageDescription = `On-chain account details for @${username}: balances, vesting, reputation and transaction history on the Steem blockchain.`;

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: { canonical },
    openGraph: { url: canonical, title: pageTitle, description: pageDescription },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
