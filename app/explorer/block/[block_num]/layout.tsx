import { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.steempro.com";

/**
 * Block and transaction detail pages are an effectively infinite, near-empty
 * crawl surface (every block number and every trx id is a URL). Letting the
 * crawler walk them burns budget on pages with almost no unique content, so
 * they are canonicalised to the explorer root and kept out of the index.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ block_num: string }>;
}): Promise<Metadata> {
  const { block_num } = await params;
  const canonical = `${BASE_URL}/explorer/block/${block_num}`;

  return {
    title: `Block ${block_num}`,
    description: `Inspect block ${block_num} on the Steem blockchain — operations, transactions and timestamp.`,
    alternates: { canonical },
    robots: { index: false, follow: true },
    openGraph: { url: canonical, title: `Block ${block_num}` },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
