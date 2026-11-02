import { BASE_URL } from "@/utils/sitemap";

/**
 * `llms.txt` — a plain-text orientation file for LLM crawlers, following the
 * llmstxt.org convention (`#` title, `>` summary, `##` sections of links).
 *
 * Deliberately *not* generated from the filesystem: this site's indexable
 * surface is mostly rewritten (`/@author/permlink`, `/:category/@author/…`,
 * community tabs), so a route walker would list rewrites that aren't URLs and
 * miss the canonical ones. The list below is the same curated surface
 * `utils/sitemap.ts` advertises, which is also the one Search Console sees —
 * one source of truth for "what this site considers important".
 *
 * Plain text, no HTML: the reader is a model, not a browser.
 */
export const dynamic = "force-static";

const LINKS: { heading: string; items: { label: string; path: string; note?: string }[] }[] = [
  {
    heading: "Discover",
    items: [
      { label: "Home", path: "/", note: "canonical trending feed" },
      { label: "Hot", path: "/hot" },
      { label: "Created", path: "/created" },
      { label: "Payout", path: "/payout" },
      { label: "Communities", path: "/communities" },
      { label: "Search", path: "/search" },
    ],
  },
  {
    heading: "Blockchain",
    items: [
      { label: "Explorer", path: "/explorer", note: "accounts, transactions, blocks" },
      { label: "Market", path: "/market", note: "order book, ticker, trade history" },
      { label: "Witnesses", path: "/witnesses" },
      { label: "Proposals", path: "/proposals", note: "DHF funding proposals" },
      { label: "Schedules", path: "/schedules" },
    ],
  },
  {
    heading: "Participate",
    items: [
      { label: "Create a post", path: "/submit", note: "requires an account" },
      { label: "Shorts", path: "/shorts" },
      { label: "Gaming", path: "/games" },
      { label: "Game: Steem Heights", path: "/games/steem-heights" },
    ],
  },
  {
    heading: "Tools",
    items: [
      { label: "Tools index", path: "/tools" },
      { label: "Account health check", path: "/tools/account-health-check" },
      { label: "Account creation", path: "/tools/account-creation" },
      { label: "Author statistic report", path: "/tools/author-statistic-report" },
      { label: "Batch commenting", path: "/tools/batch-commenting" },
      { label: "Batch transfers", path: "/tools/batch-transfer" },
      { label: "Batch voting", path: "/tools/batch-voting" },
      { label: "Community report", path: "/tools/community-report" },
    ],
  },
  {
    heading: "Profiles",
    items: [
      { label: "Author profile", path: "/@author", note: "replace 'author' with a Steem username, e.g. /@steemit" },
      { label: "Author's posts", path: "/@author/blog", note: "the blog tab of a profile" },
      { label: "Post", path: "/@author/permlink", note: "a single post; the canonical URL" },
    ],
  },
  {
    heading: "About",
    items: [
      { label: "About SteemPro", path: "/about" },
      { label: "Privacy policy", path: "/privacy-policy" },
    ],
  },
];

function buildLlmsTxt(): string {
  const lines: string[] = [];

  lines.push("# SteemPro");
  lines.push("");
  lines.push(
    "> Decentralized blogging and social media on the Steem blockchain. " +
      "Read and publish posts, follow communities, vote, transfer and manage " +
      "STEEM/SBD from a single web app. Posts and accounts live on-chain; " +
      "the site is a client for them.",
  );
  lines.push("");
  lines.push(
    "Every post, profile and community URL maps to on-chain data. " +
      `The canonical form for a post is ${BASE_URL}/@author/permlink — ` +
      "community-prefixed variants such as /tag/@author/permlink are aliases " +
      "of that same page, not separate content.",
  );
  lines.push("");

  for (const section of LINKS) {
    lines.push(`## ${section.heading}`);
    lines.push("");
    for (const item of section.items) {
      const note = item.note ? ` — ${item.note}` : "";
      lines.push(`- [${item.label}](${BASE_URL}${item.path})${note}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

export function GET(): Response {
  return new Response(buildLlmsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
