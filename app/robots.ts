import type { MetadataRoute } from "next";

/**
 * Crawl policy, in one sentence: search engines may index the site, AI
 * companies and marketing-data crawlers may not.
 *
 * robots.txt is advisory — a scraper in a datacentre can ignore it — so this is
 * not a security control. What it does do is keep the crawlers that *do* honour
 * it out of the queue: no training corpora, no SEO audits, no per-post copies
 * of the site sitting in someone else's dataset.
 */

// Trailing slash is stripped: this value is concatenated into the Sitemap
// line, and `…//sitemap.xml` is a 404 that silently costs the whole file.
const baseUrl = (
  process.env.NEXT_PUBLIC_BASE_URL || "https://www.steempro.com"
).replace(/\/+$/, "");

/**
 * Paths no crawler needs. `/*?*` keeps query-parameter permutations — search
 * pages, tracking links, sort orders — out of the index, where they would
 * compete with the canonical URL for the same content.
 */
const NOT_FOR_CRAWLERS = ["/api/", "/settings/", "/schedules/", "/submit", "/*?*"];

/**
 * Invited crawlers. Google first because it is the one that sends visitors;
 * the rest are listed explicitly so that a future tightening of the wildcard
 * group cannot accidentally drop the site out of Bing, DuckDuckGo or Yandex.
 *
 * Social unfurlers (Twitterbot, facebookexternalhit, Slackbot, Discordbot,
 * LinkedInBot, TelegramBot, WhatsApp) are deliberately *not* listed: they fall
 * under the wildcard group, and blocking them only breaks link previews.
 */
const SEARCH_ENGINES = ["Googlebot", "Bingbot", "DuckDuckBot", "YandexBot"];

/**
 * Model training and dataset building. `Google-Extended` and
 * `Applebot-Extended` are the training opt-outs for Google and Apple — they do
 * not affect Search or Siri, only the model corpora.
 */
const AI_TRAINING = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  "Google-Extended",
  "Google-CloudVertexBot",
  "Applebot-Extended",
  "CCBot",
  "Bytespider",
  "meta-externalagent",
  "meta-externalfetcher",
  "Amazonbot",
  "cohere-ai",
  "DeepSeekBot",
  "MistralAI-User",
  "PerplexityBot",
  "Perplexity-User",
  "YouBot",
  "AI2Bot",
  "Ai2Bot-Dolma",
  "Diffbot",
  "ImagesiftBot",
  "Timpibot",
  "omgili",
  "omgilibot",
  "Webzio-Extended",
  "Kangaroo Bot",
  "FriendlyCrawler",
  "ICC-Crawler",
  "img2dataset",
  "VelenPublicWebCrawler",
  "PiplBot",
  "wpbot",
  "ISSCyberRiskCrawler",
];

/** Rank trackers, backlink indexes, site-audit tools, ad-tech data brokers. */
const SEO_AND_MARKETING = [
  "AhrefsBot",
  "SemrushBot",
  "DotBot",
  "MJ12bot",
  "DataForSeoBot",
  "BLEXBot",
  "Barkrowler",
  "Screaming Frog SEO Spider",
  "serpstatbot",
  "ZoominfoBot",
  "LinkpadBot",
  "MegaIndex",
  "Rogerbot",
  "SiteAuditBot",
  "SeobilityBot",
  "SEOkicks",
  "GrapeshotCrawler",
  "Scrapy",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: SEARCH_ENGINES,
        allow: "/",
        disallow: NOT_FOR_CRAWLERS,
        crawlDelay: 5,
      },
      {
        // Everything not named above. Kept permissive so ordinary clients —
        // unfurlers, feed readers, the odd niche search engine — still work;
        // it only enforces the paths above.
        userAgent: "*",
        allow: "/",
        disallow: NOT_FOR_CRAWLERS,
        crawlDelay: 5,
      },
      {
        userAgent: AI_TRAINING,
        disallow: "/",
      },
      {
        userAgent: SEO_AND_MARKETING,
        disallow: "/",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
