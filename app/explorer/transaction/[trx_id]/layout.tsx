import { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.steempro.com";

/**
 * Transaction lookups are an unbounded, effectively empty URL space — most ids
 * resolve to nothing. Keep them crawlable (follow) but out of the index.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ trx_id: string }>;
}): Promise<Metadata> {
  const { trx_id } = await params;
  const canonical = `${BASE_URL}/explorer/transaction/${trx_id}`;

  return {
    title: `Transaction ${trx_id.slice(0, 12)}`,
    description: `Look up a Steem transaction by id and inspect its operations and metadata.`,
    alternates: { canonical },
    robots: { index: false, follow: true },
    openGraph: { url: canonical },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
