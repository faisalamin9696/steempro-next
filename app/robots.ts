import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  // Same trailing-slash normalisation as `BASE_URL` in utils/sitemap.ts:
  // this line is what points the crawler at the sitemap, so a configured
  // trailing slash would send it to `…//sitemap.xml` — a URL that 404s and
  // silently costs every child with it.
  const baseUrl = (
    process.env.NEXT_PUBLIC_BASE_URL || "https://www.steempro.com"
  ).replace(/\/+$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/settings/",
          "/schedules/",
          "/submit",
          "/*?*", // Prevent indexing search/query param URLs to prevent duplicate content issues
        ],
      },
      {
        userAgent: [
          // AI scrapers & training bots
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
          // "Google-CloudVertexBot",
          "meta-externalagent",
          "MistralAI-User",
          // SEO scrapers & data miners
          // "AhrefsBot",
          // "SemrushBot",
          // "DotBot",
          // "MJ12bot",
          // "DataForSEOBot",
          // "Scrapy",
        ],
        disallow: "/",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

