import type { MetadataRoute } from "next";

/**
 * Robots policy, shaped like the ecosystem's usual file: a `*` group with the
 * private routes, then one block per bot we refuse.
 *
 * The `Sitemap:` line is the only part a crawler needs from here — everything
 * else narrows what it may fetch.
 */

/** Signed-in workspace, write actions and query-param duplicates. */
const DISALLOW = [
  "/api/",
  "/settings/",
  "/schedules/",
  "/submit",
  "/*?*", // query-param URLs are duplicates of the clean page
];

/** AI training/scraping bots and the bulk SEO crawlers we do not serve. */
const BLOCKED_BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "ClaudeBot",
  "claude-web",
  "anthropic-ai",
  "Bytespider",
  "CCBot",
  "PerplexityBot",
  "Perplexity-User",
  "DeepSeekBot",
  "meta-externalagent",
  "MistralAI-User",
  "Amazonbot",
  "Scrapy",
  "YisouSpider",
];

export default function robots(): MetadataRoute.Robots {
  // Trailing slashes are stripped so the sitemap line never ends in `//`.
  const baseUrl = (
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.steempro.com"
  ).replace(/\/+$/, "");

  return {
    rules: [
      { userAgent: "*", disallow: DISALLOW, crawlDelay: 5 },
      ...BLOCKED_BOTS.map((bot) => ({ userAgent: bot, disallow: "/" })),
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
